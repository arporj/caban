import { Receipt, Search, Filter } from 'lucide-react'

export default function ExtratoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Extrato</h1>
        <p className="text-cn-on-surface-variant mt-1">Histórico completo de transações</p>
      </div>

      {/* Filters */}
      <div className="glass rounded-3xl p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cn-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar transações..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors text-sm">
          <Filter className="w-4 h-4" />
          Filtros
        </button>
      </div>

      {/* Empty State */}
      <div className="glass rounded-3xl p-12 text-center">
        <Receipt className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhuma transação ainda</h3>
        <p className="text-sm text-cn-on-surface-variant mb-6">Crie sua primeira transação para começar a acompanhar suas finanças.</p>
        <a href="/nova-transacao" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
          Nova Transação
        </a>
      </div>
    </div>
  )
}
