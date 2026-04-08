'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type TagFormData = {
  name: string
  color: string
}

export async function getTags() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .schema('caban')
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function createTag(formData: TagFormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('tags')
    .insert({
      user_id: user.id,
      name: formData.name,
      color: formData.color,
    })

  if (error) throw error
  revalidatePath('/tags')
}

export async function updateTag(id: string, formData: Partial<TagFormData>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('tags')
    .update(formData)
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/tags')
}

export async function deleteTag(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await supabase
    .schema('caban')
    .from('tags')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
  revalidatePath('/tags')
}
