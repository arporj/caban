'use client'

import { useState, useEffect } from 'react'
import { Tags as TagsIcon, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { getTags, createTag, updateTag, deleteTag, type TagFormData } from './actions'

const tagColors = [
  '#53ddfc', '#ba9eff', '#ff6daf', '#4ade80', '#facc15',
  '#f97316', '#ef4444', '#06b6d4', '#ae8dff', '#8455ef',
]

type Tag = {
  id: string
  name: string
  color: string
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [color, setColor] = useState('#53ddfc')

  useEffect(() => { loadTags() }, [])

  async function loadTags() {
    setLoading(true)
    try {
      const data = await getTags()
      setTags(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function resetForm() {
    setName('')
    setColor('#53ddfc')
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(tag: Tag) {
    setName(tag.name)
    setColor(tag.color)
    setEditingId(tag.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editingId) {
        await updateTag(editingId, { name, color })
      } else {
        await createTag({ name, color })
      }
      resetForm()
      await loadTags()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta tag?')) return
    try {
      await deleteTag(id)
      await loadTags()
    } catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Tags</h1>
          <p className="text-cn-on-surface-variant mt-1">Crie tags para filtrar e organizar lançamentos</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Tag
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cn-on-surface">
              {editingId ? 'Editar Tag' : 'Nova Tag'}
            </h3>
            <button onClick={resetForm} className="text-cn-on-surface-variant hover:text-cn-on-surface">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                Nome *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                placeholder="Ex: Urgente, Pessoal, Trabalho"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                Cor
              </label>
              <div className="flex gap-2 flex-wrap">
                {tagColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-cn-surface ring-cn-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Tag'}
              </button>
              <button type="button" onClick={resetForm} className="px-6 py-3 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-cn-on-surface-variant">Carregando...</p>
        </div>
      ) : tags.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <TagsIcon className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhuma tag cadastrada</h3>
          <p className="text-sm text-cn-on-surface-variant">Tags são úteis para filtrar transações de forma personalizada.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-3">
          {tags.map((tag) => (
            <div key={tag.id} className="glass rounded-2xl px-4 py-3 flex items-center gap-3 group hover:shadow-celestial transition-all">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
              <span className="text-sm font-medium text-cn-on-surface">{tag.name}</span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => startEdit(tag)} className="p-1 rounded-lg hover:bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(tag.id)} className="p-1 rounded-lg hover:bg-cn-error/10 text-cn-on-surface-variant hover:text-cn-error transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
