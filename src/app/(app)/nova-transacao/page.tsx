'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight, Save, Loader2, X } from 'lucide-react'
import { getFormData, createTransaction, type TransactionFormData } from './actions'

type TransactionType = 'despesa' | 'receita' | 'transferencia'
type RecurrenceMode = 'unica' | 'fixa' | 'parcelada'

type Account = { id: string; name: string; type: string; color: string; icon: string }
type Category = { id: string; name: string; type: string; icon: string; color: string; parent_id: string | null }
type Tag = { id: string; name: string; color: string }
type CreditCard = { id: string; name: string; brand: string; color: string; closing_day: number; due_day: number }

function getNextStatementMonth(closingDay: number) {
  const now = new Date()
  const day = now.getDate()
  let month = now.getMonth() + 1
  let year = now.getFullYear()

  // If we're past the closing day, it goes to next month's statement
  if (day > closingDay) {
    month++
    if (month > 12) { month = 1; year++ }
  }
  return { month, year }
}

function formatMonthLabel(m: number, y: number) {
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  return `${months[m - 1]}/${y}`
}

export default function NovaTransacaoPage() {
  const router = useRouter()
  const [type, setType] = useState<TransactionType>('despesa')
  const [recurrenceMode, setRecurrenceMode] = useState<RecurrenceMode>('unica')
  const [installmentValueMode, setInstallmentValueMode] = useState<'por_parcela' | 'total'>('total')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [creditCardId, setCreditCardId] = useState('')
  const [statementMonth, setStatementMonth] = useState(0)
  const [statementYear, setStatementYear] = useState(0)
  const [recurrencePeriod, setRecurrencePeriod] = useState<'dia' | 'semana' | 'mes' | 'ano'>('mes')
  const [recurrenceCount, setRecurrenceCount] = useState(2)

  const [accounts, setAccounts] = useState<Account[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [creditCards, setCreditCards] = useState<CreditCard[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    getFormData().then(data => {
      setAccounts(data.accounts)
      setCategories(data.categories)
      setTags(data.tags)
      setCreditCards(data.creditCards)
      setLoading(false)
    })
  }, [])

  // Update statement month when credit card changes
  useEffect(() => {
    if (creditCardId) {
      const card = creditCards.find(c => c.id === creditCardId)
      if (card) {
        const { month, year } = getNextStatementMonth(card.closing_day)
        setStatementMonth(month)
        setStatementYear(year)
      }
    }
  }, [creditCardId, creditCards])

  const isCreditCard = !!creditCardId
  const parentCategories = categories.filter(c => !c.parent_id)
  const filteredCategories = parentCategories.filter(c =>
    c.type === 'ambos' || c.type === type
  )

  // Format amount input as currency
  const handleAmountChange = (value: string) => {
    const digits = value.replace(/\D/g, '')
    if (!digits) { setAmount(''); return }
    const num = parseInt(digits) / 100
    setAmount(num.toLocaleString('pt-BR', { minimumFractionDigits: 2 }))
  }

  const getNumericAmount = useCallback(() => {
    return parseFloat(amount.replace(/\./g, '').replace(',', '.')) || 0
  }, [amount])

  const statementOptions = useCallback(() => {
    const opts = []
    const now = new Date()
    for (let i = -1; i <= 6; i++) {
      let m = now.getMonth() + 1 + i
      let y = now.getFullYear()
      while (m > 12) { m -= 12; y++ }
      while (m < 1) { m += 12; y-- }
      opts.push({ month: m, year: y, label: formatMonthLabel(m, y) })
    }
    return opts
  }, [])

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const numericAmount = getNumericAmount()
    if (numericAmount <= 0) { setError('Informe um valor válido'); return }
    if (!isCreditCard && !accountId) { setError('Selecione uma conta'); return }
    if (isCreditCard && !creditCardId) { setError('Selecione um cartão'); return }

    setSaving(true)

    try {
      const data: TransactionFormData = {
        type,
        amount: numericAmount,
        description: description || 'Sem descrição',
        notes: notes || undefined,
        transaction_date: transactionDate,
        account_id: accountId || accounts[0]?.id || '',
        category_id: categoryId || undefined,
        tag_ids: selectedTags.length > 0 ? selectedTags : undefined,
        recurrence_mode: recurrenceMode,
        recurrence_period: recurrenceMode !== 'unica' ? recurrencePeriod : undefined,
        recurrence_interval: 1,
        recurrence_count: recurrenceMode !== 'unica' ? recurrenceCount : undefined,
        installment_value_mode: recurrenceMode === 'parcelada' ? installmentValueMode : undefined,
        credit_card_id: isCreditCard ? creditCardId : undefined,
        statement_month: isCreditCard ? statementMonth : undefined,
        statement_year: isCreditCard ? statementYear : undefined,
      }

      await createTransaction(data)
      setSuccess(true)
      setTimeout(() => router.push('/extrato'), 1200)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  const typeOptions = [
    { value: 'despesa' as const, label: 'Despesa', icon: ArrowDownRight, color: 'cn-tertiary' },
    { value: 'receita' as const, label: 'Receita', icon: ArrowUpRight, color: 'cn-secondary' },
    { value: 'transferencia' as const, label: 'Transferência', icon: ArrowLeftRight, color: 'cn-primary' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-cn-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Nova Transação</h1>
        <p className="text-cn-on-surface-variant mt-1">Registre um novo lançamento</p>
      </div>

      {success && (
        <div className="rounded-2xl bg-cn-secondary/10 p-4 text-cn-secondary text-sm font-medium text-center animate-pulse">
          ✅ Transação salva com sucesso! Redirecionando...
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass rounded-3xl p-8 space-y-6">
        {/* Type Selector */}
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all
                ${type === opt.value
                  ? `bg-${opt.color}/15 text-${opt.color} ring-1 ring-${opt.color}/30`
                  : 'text-cn-on-surface-variant hover:bg-cn-surface-container-high/50'
                }
              `}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Valor (R$) *
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder="0,00"
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface text-2xl font-bold placeholder:text-cn-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-cn-primary/40"
          />
        </div>

        {/* Date + Recurrence */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Data *
            </label>
            <input
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Repetição
            </label>
            <select
              value={recurrenceMode}
              onChange={(e) => setRecurrenceMode(e.target.value as RecurrenceMode)}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
            >
              <option value="unica">Única</option>
              <option value="fixa">Fixa</option>
              <option value="parcelada">Parcelada</option>
            </select>
          </div>
        </div>

        {/* Recurrence Options */}
        {recurrenceMode !== 'unica' && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-cn-surface-container/60">
            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                Periodicidade *
              </label>
              <select
                value={recurrencePeriod}
                onChange={(e) => setRecurrencePeriod(e.target.value as 'dia' | 'semana' | 'mes' | 'ano')}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
              >
                <option value="dia">Diária</option>
                <option value="semana">Semanal</option>
                <option value="mes">Mensal</option>
                <option value="ano">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                {recurrenceMode === 'fixa' ? 'Repete a cada N *' : 'Nº de parcelas *'}
              </label>
              <input
                type="number"
                min={recurrenceMode === 'fixa' ? 1 : 2}
                value={recurrenceCount}
                onChange={(e) => setRecurrenceCount(parseInt(e.target.value) || 2)}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
              />
            </div>

            {recurrenceMode === 'parcelada' && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                  O valor informado é
                </label>
                <div className="flex gap-2">
                  {(['total', 'por_parcela'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setInstallmentValueMode(mode)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                        ${installmentValueMode === mode
                          ? 'bg-cn-primary/15 text-cn-primary ring-1 ring-cn-primary/30'
                          : 'text-cn-on-surface-variant hover:bg-cn-surface-container-high/50'
                        }
                      `}
                    >
                      {mode === 'total' ? 'Valor Total' : 'Valor por Parcela'}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Descrição
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Supermercado"
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
          />
        </div>

        {/* Destination: Account OR Credit Card */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Conta {isCreditCard ? '' : '*'}
            </label>
            <select
              value={isCreditCard ? '' : accountId}
              onChange={(e) => { setAccountId(e.target.value); setCreditCardId('') }}
              disabled={isCreditCard}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm disabled:opacity-40"
            >
              <option value="">Selecione...</option>
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Cartão de Crédito
            </label>
            <select
              value={creditCardId}
              onChange={(e) => { setCreditCardId(e.target.value); if (e.target.value) setAccountId('') }}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
            >
              <option value="">Nenhum</option>
              {creditCards.map(cc => (
                <option key={cc.id} value={cc.id}>{cc.name} ({cc.brand})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statement month (only for credit card) */}
        {isCreditCard && (
          <div className="p-4 rounded-2xl bg-cn-surface-container/60">
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Lançar na fatura de *
            </label>
            <select
              value={`${statementMonth}-${statementYear}`}
              onChange={(e) => {
                const [m, y] = e.target.value.split('-').map(Number)
                setStatementMonth(m)
                setStatementYear(y)
              }}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
            >
              {statementOptions().map(opt => (
                <option key={`${opt.month}-${opt.year}`} value={`${opt.month}-${opt.year}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Category */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map(cat => {
              const subs = categories.filter(c => c.parent_id === cat.id)
              return (
                <optgroup key={cat.id} label={cat.name}>
                  <option value={cat.id}>{cat.name} (geral)</option>
                  {subs.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </optgroup>
              )
            })}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Observações
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Observações adicionais..."
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm resize-none"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all
                    ${selectedTags.includes(tag.id)
                      ? 'ring-1 ring-offset-1 ring-offset-transparent'
                      : 'opacity-50 hover:opacity-80'
                    }
                  `}
                  style={{
                    backgroundColor: `${tag.color}20`,
                    color: tag.color,
                    ...(selectedTags.includes(tag.id) ? { ringColor: tag.color } : {}),
                  }}
                >
                  {selectedTags.includes(tag.id) && <span className="mr-1">✓</span>}
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-cn-error/10 p-4 flex items-center justify-between">
            <p className="text-cn-error text-sm">{error}</p>
            <button type="button" onClick={() => setError('')}><X className="w-4 h-4 text-cn-error" /></button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  )
}
