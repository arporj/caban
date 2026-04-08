import { Target } from 'lucide-react'

export default function PlanejamentoPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Planejamento</h1>
        <p className="text-cn-on-surface-variant mt-1">Defina orçamentos e metas por categoria</p>
      </div>

      <div className="glass rounded-3xl p-12 text-center">
        <Target className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Em breve</h3>
        <p className="text-sm text-cn-on-surface-variant">Defina orçamentos por categoria e acompanhe seu progresso mensal.</p>
      </div>
    </div>
  )
}
