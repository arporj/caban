'use client'

import { useState, useEffect, useMemo } from 'react'
import { FolderTree, Plus, X, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory, type CategoryFormData } from './actions'

const categoryTypes = [
  { value: 'receita' as const, label: 'Receita', colorClass: 'text-cn-secondary bg-cn-secondary/15' },
  { value: 'despesa' as const, label: 'Despesa', colorClass: 'text-cn-tertiary bg-cn-tertiary/15' },
  { value: 'ambos' as const, label: 'Ambos', colorClass: 'text-cn-primary bg-cn-primary/15' },
]

const catColors = [
  '#ba9eff', '#53ddfc', '#ff6daf', '#4ade80', '#facc15',
  '#f97316', '#ef4444', '#06b6d4', '#ae8dff', '#8455ef',
]

type Category = {
  id: string
  name: string
  icon: string
  color: string
  type: string
  parent_id: string | null
  is_active: boolean
  sort_order: number
}

export default function CategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [type, setType] = useState<CategoryFormData['type']>('ambos')
  const [color, setColor] = useState('#ba9eff')
  const [parentId, setParentId] = useState<string | null>(null)

  useEffect(() => { loadCategories() }, [])

  // Organizar categorias pai (sem parent_id)
  const parentCategories = useMemo(
    () => categories.filter((c) => c.parent_id === null),
    [categories]
  )

  const getChildren = (parentId: string) =>
    categories.filter((c) => c.parent_id === parentId)

  async function loadCategories() {
    setLoading(true)
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function resetForm() {
    setName('')
    setType('ambos')
    setColor('#ba9eff')
    setParentId(null)
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(cat: Category) {
    setName(cat.name)
    setType(cat.type as CategoryFormData['type'])
    setColor(cat.color)
    setParentId(cat.parent_id)
    setEditingId(cat.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const formData: CategoryFormData = { name, icon: 'tag', color, type, parent_id: parentId }
      if (editingId) {
        await updateCategory(editingId, formData)
      } else {
        await createCategory(formData)
      }
      resetForm()
      await loadCategories()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir esta categoria? Subcategorias também serão excluídas.')) return
    try {
      await deleteCategory(id)
      await loadCategories()
    } catch (e) { console.error(e) }
  }

  const TypeBadge = ({ type }: { type: string }) => {
    const opt = categoryTypes.find((t) => t.value === type)
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${opt?.colorClass ?? 'text-cn-on-surface-variant bg-cn-surface-container-high'}`}>
        {opt?.label ?? type}
      </span>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Categorias</h1>
          <p className="text-cn-on-surface-variant mt-1">Organize seus lançamentos com categorias e subcategorias</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cn-on-surface">
              {editingId ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <button onClick={resetForm} className="text-cn-on-surface-variant hover:text-cn-on-surface">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Nome *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                  placeholder="Ex: Alimentação" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Tipo *</label>
                <div className="flex gap-2">
                  {categoryTypes.map((t) => (
                    <button key={t.value} type="button" onClick={() => setType(t.value)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-medium transition-all ${type === t.value ? t.colorClass + ' ring-1 ring-current/30' : 'text-cn-on-surface-variant hover:bg-cn-surface-container-high/50'}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Categoria Pai (opcional)</label>
              <select value={parentId ?? ''} onChange={(e) => setParentId(e.target.value || null)}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm">
                <option value="">Nenhuma (categoria raiz)</option>
                {parentCategories.filter(c => c.id !== editingId).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {catColors.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-cn-surface ring-cn-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Categoria'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-6 py-3 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors font-medium">
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
      ) : categories.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <FolderTree className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhuma categoria cadastrada</h3>
          <p className="text-sm text-cn-on-surface-variant">Crie categorias para classificar receitas e despesas.</p>
        </div>
      ) : (
        <div className="glass rounded-3xl p-4 space-y-1">
          {parentCategories.map((cat) => {
            const children = getChildren(cat.id)
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between px-4 py-3 rounded-2xl hover:bg-cn-surface-container-high/40 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${cat.color}20` }}>
                      <FolderTree className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-cn-on-surface">{cat.name}</p>
                      {children.length > 0 && (
                        <p className="text-xs text-cn-on-surface-variant">{children.length} subcategoria{children.length > 1 ? 's' : ''}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TypeBadge type={cat.type} />
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(cat)} className="p-2 rounded-lg hover:bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(cat.id)} className="p-2 rounded-lg hover:bg-cn-error/10 text-cn-on-surface-variant hover:text-cn-error transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between px-4 py-2.5 pl-14 rounded-2xl hover:bg-cn-surface-container-high/30 transition-colors group">
                    <div className="flex items-center gap-3">
                      <ChevronRight className="w-3 h-3 text-cn-on-surface-variant/40" />
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: child.color }} />
                      <p className="text-sm text-cn-on-surface">{child.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <TypeBadge type={child.type} />
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(child)} className="p-1.5 rounded-lg hover:bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(child.id)} className="p-1.5 rounded-lg hover:bg-cn-error/10 text-cn-on-surface-variant hover:text-cn-error transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
