'use client'

import { Search, Filter, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

type Props = {
  accounts: Array<{ id: string; name: string }>
  categories: Array<{ id: string; name: string }>
  initialFilters: Record<string, string | undefined>
}

export default function ExtratoFilters({ accounts, categories, initialFilters }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(
    !!(initialFilters.type || initialFilters.account_id || initialFilters.category_id || initialFilters.date_from)
  )
  const [search, setSearch] = useState(initialFilters.search ?? '')

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`/extrato?${params.toString()}`)
  }, [router, searchParams])

  const handleSearch = useCallback(() => {
    updateFilter('search', search.trim())
  }, [search, updateFilter])

  const clearFilters = useCallback(() => {
    router.push('/extrato')
    setSearch('')
  }, [router])

  const hasFilters = !!(initialFilters.type || initialFilters.account_id || initialFilters.category_id || initialFilters.date_from || initialFilters.search)

  return (
    <div className="glass rounded-3xl p-5 space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cn-on-surface-variant" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Buscar transações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-colors ${
            showFilters
              ? 'bg-cn-primary/15 text-cn-primary'
              : 'bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filtros
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2.5 rounded-xl text-xs text-cn-tertiary hover:bg-cn-tertiary/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-cn-outline/10">
          <select
            defaultValue={initialFilters.type ?? ''}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="px-3 py-2 rounded-xl bg-cn-surface-container-low text-cn-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-cn-primary/40"
          >
            <option value="">Todos os tipos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
            <option value="transferencia">Transferências</option>
          </select>

          <select
            defaultValue={initialFilters.account_id ?? ''}
            onChange={(e) => updateFilter('account_id', e.target.value)}
            className="px-3 py-2 rounded-xl bg-cn-surface-container-low text-cn-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-cn-primary/40"
          >
            <option value="">Todas as contas</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          <select
            defaultValue={initialFilters.category_id ?? ''}
            onChange={(e) => updateFilter('category_id', e.target.value)}
            className="px-3 py-2 rounded-xl bg-cn-surface-container-low text-cn-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-cn-primary/40"
          >
            <option value="">Todas as categorias</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <input
            type="date"
            defaultValue={initialFilters.date_from ?? ''}
            onChange={(e) => updateFilter('date_from', e.target.value)}
            className="px-3 py-2 rounded-xl bg-cn-surface-container-low text-cn-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-cn-primary/40"
            placeholder="A partir de"
          />
        </div>
      )}
    </div>
  )
}
