'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CreditCardFormData = {
  name: string
  brand: 'visa' | 'mastercard' | 'elo' | 'amex' | 'hipercard' | 'outro'
  color: string
  closing_day: number
  due_day: number
  credit_limit: number
  payment_account_id?: string | null
}

export async function getCreditCards() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .schema('caban')
    .from('credit_cards')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createCreditCard(formData: CreditCardFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('credit_cards')
    .insert({
      user_id: user.id,
      name: formData.name,
      brand: formData.brand,
      color: formData.color,
      closing_day: formData.closing_day,
      due_day: formData.due_day,
      credit_limit: formData.credit_limit,
      payment_account_id: formData.payment_account_id || null,
    })

  if (error) throw error
  revalidatePath('/cartoes')
  revalidatePath('/dashboard')
}

export async function updateCreditCard(id: string, formData: Partial<CreditCardFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('credit_cards')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/cartoes')
  revalidatePath('/dashboard')
}

export async function deleteCreditCard(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('credit_cards')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/cartoes')
  revalidatePath('/dashboard')
}
