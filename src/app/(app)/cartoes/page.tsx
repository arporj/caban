import { CreditCard, Plus } from 'lucide-react'

export default function CartoesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Cartões de Crédito</h1>
          <p className="text-cn-on-surface-variant mt-1">Gerencie seus cartões e faturas</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Novo Cartão
        </button>
      </div>

      <div className="glass rounded-3xl p-12 text-center">
        <CreditCard className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhum cartão cadastrado</h3>
        <p className="text-sm text-cn-on-surface-variant">Adicione um cartão de crédito para acompanhar suas faturas.</p>
      </div>
    </div>
  )
}
