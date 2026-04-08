'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CategoryFormData = {
  name: string
  icon: string
  color: string
  type: 'receita' | 'despesa' | 'ambos'
  parent_id?: string | null
}

export async function getCategories() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .schema('caban')
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createCategory(formData: CategoryFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('categories')
    .insert({
      user_id: user.id,
      name: formData.name,
      icon: formData.icon,
      color: formData.color,
      type: formData.type,
      parent_id: formData.parent_id || null,
    })

  if (error) throw error
  revalidatePath('/categorias')
}

export async function updateCategory(id: string, formData: Partial<CategoryFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('categories')
    .update({ ...formData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/categorias')
}

export async function deleteCategory(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/categorias')
}
