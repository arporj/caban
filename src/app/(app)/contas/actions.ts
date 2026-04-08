'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type AccountFormData = {
  name: string
  type: 'corrente' | 'poupanca' | 'dinheiro' | 'investimento'
  color: string
  icon: string
  initial_balance: number
}

export async function getAccounts() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .schema('caban')
    .from('accounts')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createAccount(formData: AccountFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('accounts')
    .insert({
      user_id: user.id,
      name: formData.name,
      type: formData.type,
      color: formData.color,
      icon: formData.icon,
      initial_balance: formData.initial_balance,
    })

  if (error) throw error
  revalidatePath('/contas')
  revalidatePath('/dashboard')
}

export async function updateAccount(id: string, formData: Partial<AccountFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('accounts')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/contas')
  revalidatePath('/dashboard')
}

export async function deleteAccount(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('accounts')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/contas')
  revalidatePath('/dashboard')
}
