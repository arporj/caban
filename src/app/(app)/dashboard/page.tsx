import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'

// Mock data for initial visual
const stats = [
  {
    label: 'Saldo Total',
    value: 'R$ 12.450,00',
    change: '+5,2%',
    trend: 'up',
    icon: Wallet,
    color: 'cn-primary',
  },
  {
    label: 'Receitas do Mês',
    value: 'R$ 8.500,00',
    change: '+12,3%',
    trend: 'up',
    icon: TrendingUp,
    color: 'cn-secondary',
  },
  {
    label: 'Despesas do Mês',
    value: 'R$ 4.320,00',
    change: '-3,1%',
    trend: 'down',
    icon: TrendingDown,
    color: 'cn-tertiary',
  },
  {
    label: 'Fatura Cartão',
    value: 'R$ 2.180,00',
    change: 'Vence 10/05',
    trend: 'neutral',
    icon: CreditCard,
    color: 'cn-primary',
  },
]

const recentTransactions = [
  { description: 'Supermercado Extra', category: 'Alimentação', amount: -320.50, date: '08/04', type: 'despesa' },
  { description: 'Salário', category: 'Salário', amount: 8500.00, date: '05/04', type: 'receita' },
  { description: 'Uber', category: 'Transporte', amount: -45.90, date: '07/04', type: 'despesa' },
  { description: 'Freelance Website', category: 'Freelance', amount: 2500.00, date: '03/04', type: 'receita' },
  { description: 'Netflix', category: 'Lazer', amount: -55.90, date: '01/04', type: 'despesa' },
  { description: 'Farmácia', category: 'Saúde', amount: -89.90, date: '06/04', type: 'despesa' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Dashboard</h1>
        <p className="text-cn-on-surface-variant mt-1">Visão geral das suas finanças — Abril 2026</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-3xl p-6 hover:shadow-celestial transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-11 h-11 rounded-2xl bg-${stat.color}/15 flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}`} />
              </div>
              {stat.trend !== 'neutral' && (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' 
                    ? 'text-cn-secondary bg-cn-secondary/10' 
                    : 'text-cn-tertiary bg-cn-tertiary/10'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              )}
              {stat.trend === 'neutral' && (
                <span className="text-xs font-medium text-cn-on-surface-variant px-2 py-1 rounded-full bg-cn-surface-container-high">
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-cn-on-surface">{stat.value}</p>
            <p className="text-xs text-cn-on-surface-variant mt-1 uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-cn-on-surface">Últimas Transações</h2>
          <a href="/extrato" className="text-sm text-cn-primary hover:underline font-medium">
            Ver todas
          </a>
        </div>

        <div className="space-y-1">
          {recentTransactions.map((tx, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-cn-surface-container-high/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  tx.type === 'receita' ? 'bg-cn-secondary/15' : 'bg-cn-tertiary/15'
                }`}>
                  {tx.type === 'receita' 
                    ? <ArrowUpRight className="w-5 h-5 text-cn-secondary" />
                    : <ArrowDownRight className="w-5 h-5 text-cn-tertiary" />
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-cn-on-surface">{tx.description}</p>
                  <p className="text-xs text-cn-on-surface-variant">{tx.category}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  tx.type === 'receita' ? 'text-cn-secondary' : 'text-cn-on-surface'
                }`}>
                  {tx.type === 'receita' ? '+' : ''}{tx.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p className="text-xs text-cn-on-surface-variant">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
