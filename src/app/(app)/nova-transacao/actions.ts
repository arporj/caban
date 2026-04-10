'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TransactionFormData = {
  type: 'receita' | 'despesa' | 'transferencia'
  amount: number
  description: string
  notes?: string
  transaction_date: string
  account_id: string
  category_id?: string
  tag_ids?: string[]
  is_paid?: boolean
  // Recurrence
  recurrence_mode: 'unica' | 'fixa' | 'parcelada'
  recurrence_period?: 'dia' | 'semana' | 'mes' | 'ano'
  recurrence_interval?: number
  recurrence_count?: number
  // Installment
  installment_value_mode?: 'por_parcela' | 'total'
  // Credit card
  credit_card_id?: string
  statement_month?: number
  statement_year?: number
}

export async function getFormData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { accounts: [], categories: [], tags: [], creditCards: [] }

  const [accounts, categories, tags, creditCards] = await Promise.all([
    supabase.schema('caban').from('accounts').select('id, name, type, color, icon')
      .eq('user_id', user.id).eq('is_active', true).order('sort_order'),
    supabase.schema('caban').from('categories').select('id, name, type, icon, color, parent_id')
      .eq('user_id', user.id).eq('is_active', true).order('sort_order'),
    supabase.schema('caban').from('tags').select('id, name, color')
      .eq('user_id', user.id).order('name'),
    supabase.schema('caban').from('credit_cards').select('id, name, brand, color, closing_day, due_day')
      .eq('user_id', user.id).eq('is_active', true).order('name'),
  ])

  return {
    accounts: accounts.data ?? [],
    categories: categories.data ?? [],
    tags: tags.data ?? [],
    creditCards: creditCards.data ?? [],
  }
}

async function getOrCreateStatement(
  supabase: Awaited<ReturnType<typeof createClient>>,
  creditCardId: string,
  month: number,
  year: number,
  dueDay: number
) {
  // Check if statement exists
  const { data: existing } = await supabase
    .schema('caban')
    .from('credit_card_statements')
    .select('id')
    .eq('credit_card_id', creditCardId)
    .eq('month', month)
    .eq('year', year)
    .maybeSingle()

  if (existing) return existing.id

  // Create statement
  const dueDate = new Date(year, month - 1, dueDay)
  const { data: created, error } = await supabase
    .schema('caban')
    .from('credit_card_statements')
    .insert({
      credit_card_id: creditCardId,
      month,
      year,
      due_date: dueDate.toISOString().split('T')[0],
    })
    .select('id')
    .single()

  if (error) throw error
  return created.id
}

export async function createTransaction(formData: TransactionFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // If it's a credit card transaction
  if (formData.credit_card_id && formData.statement_month && formData.statement_year) {
    // Get card details for due_day
    const { data: card } = await supabase
      .schema('caban')
      .from('credit_cards')
      .select('due_day')
      .eq('id', formData.credit_card_id)
      .single()

    if (!card) throw new Error('Cartão não encontrado')

    const statementId = await getOrCreateStatement(
      supabase,
      formData.credit_card_id,
      formData.statement_month,
      formData.statement_year,
      card.due_day
    )

    // Calculate amount per installment if needed
    let amountPerItem = formData.amount
    const totalInstallments = formData.recurrence_mode === 'parcelada' ? (formData.recurrence_count ?? 1) : 1
    const originalTotal = formData.amount

    if (formData.recurrence_mode === 'parcelada' && formData.installment_value_mode === 'total') {
      amountPerItem = Math.round((formData.amount / totalInstallments) * 100) / 100
    }

    if (formData.recurrence_mode === 'parcelada' && totalInstallments > 1) {
      // Create multiple installments across statements
      let currentMonth = formData.statement_month
      let currentYear = formData.statement_year
      let parentId: string | null = null

      for (let i = 1; i <= totalInstallments; i++) {
        const stmtId = await getOrCreateStatement(supabase, formData.credit_card_id, currentMonth, currentYear, card.due_day)

        const { data: tx, error } = await supabase
          .schema('caban')
          .from('credit_card_transactions')
          .insert({
            user_id: user.id,
            credit_card_id: formData.credit_card_id,
            statement_id: stmtId,
            category_id: formData.category_id || null,
            description: `${formData.description} (${i}/${totalInstallments})`,
            notes: formData.notes || null,
            amount: amountPerItem,
            transaction_date: formData.transaction_date,
            installment_number: i,
            total_installments: totalInstallments,
            installment_value_mode: formData.installment_value_mode,
            original_total_amount: formData.installment_value_mode === 'total' ? originalTotal : null,
            recurrence_mode: 'parcelada',
            recurrence_parent_id: parentId,
          })
          .select('id')
          .single()

        if (error) throw error
        if (i === 1) parentId = tx.id

        // Handle tags for first installment
        if (i === 1 && formData.tag_ids?.length) {
          await supabase.schema('caban').from('cc_transaction_tags').insert(
            formData.tag_ids.map(tagId => ({ cc_transaction_id: tx.id, tag_id: tagId }))
          )
        }

        // Move to next month
        currentMonth++
        if (currentMonth > 12) {
          currentMonth = 1
          currentYear++
        }
      }
    } else {
      // Single credit card transaction
      const { data: tx, error } = await supabase
        .schema('caban')
        .from('credit_card_transactions')
        .insert({
          user_id: user.id,
          credit_card_id: formData.credit_card_id,
          statement_id: statementId,
          category_id: formData.category_id || null,
          description: formData.description,
          notes: formData.notes || null,
          amount: formData.amount,
          transaction_date: formData.transaction_date,
          recurrence_mode: formData.recurrence_mode,
          recurrence_period: formData.recurrence_period || null,
          recurrence_interval: formData.recurrence_interval || null,
          recurrence_count: formData.recurrence_count || null,
        })
        .select('id')
        .single()

      if (error) throw error

      if (formData.tag_ids?.length) {
        await supabase.schema('caban').from('cc_transaction_tags').insert(
          formData.tag_ids.map(tagId => ({ cc_transaction_id: tx.id, tag_id: tagId }))
        )
      }
    }
  } else {
    // Regular account transaction
    let amountPerItem = formData.amount
    const totalInstallments = formData.recurrence_mode === 'parcelada' ? (formData.recurrence_count ?? 1) : 1
    const originalTotal = formData.amount

    if (formData.recurrence_mode === 'parcelada' && formData.installment_value_mode === 'total') {
      amountPerItem = Math.round((formData.amount / totalInstallments) * 100) / 100
    }

    if (formData.recurrence_mode === 'parcelada' && totalInstallments > 1) {
      let parentId: string | null = null
      const baseDate = new Date(formData.transaction_date)

      for (let i = 1; i <= totalInstallments; i++) {
        const txDate = new Date(baseDate)
        if (formData.recurrence_period === 'dia') txDate.setDate(txDate.getDate() + (i - 1) * (formData.recurrence_interval ?? 1))
        else if (formData.recurrence_period === 'semana') txDate.setDate(txDate.getDate() + (i - 1) * 7 * (formData.recurrence_interval ?? 1))
        else if (formData.recurrence_period === 'mes') txDate.setMonth(txDate.getMonth() + (i - 1) * (formData.recurrence_interval ?? 1))
        else if (formData.recurrence_period === 'ano') txDate.setFullYear(txDate.getFullYear() + (i - 1) * (formData.recurrence_interval ?? 1))

        const { data: tx, error } = await supabase
          .schema('caban')
          .from('transactions')
          .insert({
            user_id: user.id,
            account_id: formData.account_id,
            category_id: formData.category_id || null,
            type: formData.type,
            amount: amountPerItem,
            description: `${formData.description} (${i}/${totalInstallments})`,
            notes: formData.notes || null,
            transaction_date: txDate.toISOString().split('T')[0],
            is_paid: formData.is_paid ?? false,
            recurrence_mode: 'parcelada',
            recurrence_period: formData.recurrence_period || 'mes',
            recurrence_interval: formData.recurrence_interval ?? 1,
            recurrence_count: totalInstallments,
            recurrence_parent_id: parentId,
            installment_number: i,
            total_installments: totalInstallments,
            installment_value_mode: formData.installment_value_mode,
            original_total_amount: formData.installment_value_mode === 'total' ? originalTotal : null,
          })
          .select('id')
          .single()

        if (error) throw error
        if (i === 1) parentId = tx.id

        if (i === 1 && formData.tag_ids?.length) {
          await supabase.schema('caban').from('transaction_tags').insert(
            formData.tag_ids.map(tagId => ({ transaction_id: tx.id, tag_id: tagId }))
          )
        }
      }
    } else {
      const { data: tx, error } = await supabase
        .schema('caban')
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: formData.account_id,
          category_id: formData.category_id || null,
          type: formData.type,
          amount: formData.amount,
          description: formData.description,
          notes: formData.notes || null,
          transaction_date: formData.transaction_date,
          is_paid: formData.is_paid ?? false,
          recurrence_mode: formData.recurrence_mode,
          recurrence_period: formData.recurrence_period || null,
          recurrence_interval: formData.recurrence_interval ?? 1,
          recurrence_count: formData.recurrence_count || null,
        })
        .select('id')
        .single()

      if (error) throw error

      if (formData.tag_ids?.length) {
        await supabase.schema('caban').from('transaction_tags').insert(
          formData.tag_ids.map(tagId => ({ transaction_id: tx.id, tag_id: tagId }))
        )
      }
    }
  }

  revalidatePath('/dashboard')
  revalidatePath('/extrato')
  revalidatePath('/nova-transacao')
}

export async function getTransactions(filters?: {
  search?: string
  type?: string
  account_id?: string
  category_id?: string
  date_from?: string
  date_to?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  let query = supabase
    .schema('caban')
    .from('transactions')
    .select(`
      *,
      account:accounts(id, name, color, icon),
      category:categories(id, name, icon, color),
      tags:transaction_tags(tag:tags(id, name, color))
    `)
    .eq('user_id', user.id)
    .order('transaction_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (filters?.type) query = query.eq('type', filters.type)
  if (filters?.account_id) query = query.eq('account_id', filters.account_id)
  if (filters?.category_id) query = query.eq('category_id', filters.category_id)
  if (filters?.date_from) query = query.gte('transaction_date', filters.date_from)
  if (filters?.date_to) query = query.lte('transaction_date', filters.date_to)
  if (filters?.search) query = query.ilike('description', `%${filters.search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getDashboardData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

  const [accounts, monthTx, recentTx, ccStatements] = await Promise.all([
    // All accounts for balance
    supabase.schema('caban').from('accounts').select('id, name, initial_balance, color, icon')
      .eq('user_id', user.id).eq('is_active', true),
    // This month's transactions
    supabase.schema('caban').from('transactions').select('type, amount')
      .eq('user_id', user.id)
      .gte('transaction_date', firstDay)
      .lte('transaction_date', lastDay),
    // Recent transactions (last 6)
    supabase.schema('caban').from('transactions')
      .select('id, type, amount, description, transaction_date, category:categories(name, icon, color)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6),
    // Current open credit card statements
    supabase.schema('caban').from('credit_card_statements')
      .select('total_amount, due_date, status, credit_card:credit_cards!inner(user_id)')
      .eq('credit_card.user_id', user.id)
      .eq('status', 'aberta')
      .limit(5),
  ])

  // Calculate totals
  const allTx = monthTx.data ?? []
  const receitas = allTx.filter(t => t.type === 'receita').reduce((s, t) => s + Number(t.amount), 0)
  const despesas = allTx.filter(t => t.type === 'despesa').reduce((s, t) => s + Number(t.amount), 0)

  // Sum account balances + transaction impact
  const { data: allAccountTx } = await supabase
    .schema('caban')
    .from('transactions')
    .select('account_id, type, amount')
    .eq('user_id', user.id)

  const balanceByAccount: Record<string, number> = {}
  for (const acc of (accounts.data ?? [])) {
    balanceByAccount[acc.id] = Number(acc.initial_balance)
  }
  for (const tx of (allAccountTx ?? [])) {
    if (balanceByAccount[tx.account_id] !== undefined) {
      if (tx.type === 'receita') balanceByAccount[tx.account_id] += Number(tx.amount)
      else if (tx.type === 'despesa') balanceByAccount[tx.account_id] -= Number(tx.amount)
    }
  }
  const saldoTotal = Object.values(balanceByAccount).reduce((s, v) => s + v, 0)

  // Credit card total
  const faturaTotal = (ccStatements.data ?? []).reduce((s, st) => s + Number(st.total_amount), 0)
  const nextDue = (ccStatements.data ?? []).sort((a, b) =>
    new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  )[0]

  return {
    saldoTotal,
    receitas,
    despesas,
    faturaTotal,
    nextDueDate: nextDue?.due_date,
    recentTransactions: recentTx.data ?? [],
    accounts: accounts.data ?? [],
  }
}
