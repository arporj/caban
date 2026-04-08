import { FolderTree, Plus } from 'lucide-react'

export default function CategoriasPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Categorias</h1>
          <p className="text-cn-on-surface-variant mt-1">Organize seus lançamentos com categorias e subcategorias</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Nova Categoria
        </button>
      </div>

      <div className="glass rounded-3xl p-12 text-center">
        <FolderTree className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhuma categoria cadastrada</h3>
        <p className="text-sm text-cn-on-surface-variant">Crie categorias para classificar receitas e despesas. Cada categoria pode ter subcategorias.</p>
      </div>
    </div>
  )
}
