import {
  Wallet,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react'
import { getDashboardData } from '../nova-transacao/actions'
import Link from 'next/link'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  const now = new Date()
  const monthLabel = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

  const stats = [
    {
      label: 'Saldo Total',
      value: formatCurrency(data?.saldoTotal ?? 0),
      icon: Wallet,
      color: 'cn-primary',
    },
    {
      label: 'Receitas do Mês',
      value: formatCurrency(data?.receitas ?? 0),
      trend: 'up' as const,
      icon: TrendingUp,
      color: 'cn-secondary',
    },
    {
      label: 'Despesas do Mês',
      value: formatCurrency(data?.despesas ?? 0),
      trend: 'down' as const,
      icon: TrendingDown,
      color: 'cn-tertiary',
    },
    {
      label: 'Fatura Cartão',
      value: formatCurrency(data?.faturaTotal ?? 0),
      subtitle: data?.nextDueDate ? `Vence ${formatDate(data.nextDueDate)}` : 'Sem faturas',
      icon: CreditCard,
      color: 'cn-primary',
    },
  ]

  const recentTransactions = data?.recentTransactions ?? []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Dashboard</h1>
          <p className="text-cn-on-surface-variant mt-1 capitalize">
            Visão geral das suas finanças — {monthLabel}
          </p>
        </div>
        <Link
          href="/nova-transacao"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          + Nova Transação
        </Link>
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
              {stat.trend && (
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up'
                    ? 'text-cn-secondary bg-cn-secondary/10'
                    : 'text-cn-tertiary bg-cn-tertiary/10'
                }`}>
                  {stat.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  mês atual
                </span>
              )}
              {stat.subtitle && (
                <span className="text-xs font-medium text-cn-on-surface-variant px-2 py-1 rounded-full bg-cn-surface-container-high">
                  {stat.subtitle}
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
          <Link href="/extrato" className="text-sm text-cn-primary hover:underline font-medium">
            Ver todas
          </Link>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-cn-on-surface-variant/30 mx-auto mb-3" />
            <p className="text-sm text-cn-on-surface-variant">Nenhuma transação registrada ainda.</p>
            <Link
              href="/nova-transacao"
              className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity text-sm"
            >
              Criar primeira transação
            </Link>
          </div>
        ) : (
          <div className="space-y-1">
            {recentTransactions.map((tx: {
              id: string
              type: string
              amount: number
              description: string
              transaction_date: string
              category: { name: string; icon: string; color: string } | null
            }) => (
              <div
                key={tx.id}
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
                    <p className="text-sm font-medium text-cn-on-surface">{tx.description || 'Sem descrição'}</p>
                    <p className="text-xs text-cn-on-surface-variant">{tx.category?.name ?? '—'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${
                    tx.type === 'receita' ? 'text-cn-secondary' : 'text-cn-on-surface'
                  }`}>
                    {tx.type === 'receita' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </p>
                  <p className="text-xs text-cn-on-surface-variant">{formatDate(tx.transaction_date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
