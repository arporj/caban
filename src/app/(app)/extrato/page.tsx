import { Receipt, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { getTransactions, getFormData } from '../nova-transacao/actions'
import Link from 'next/link'
import ExtratoFilters from './ExtratoFilters'

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export default async function ExtratoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const params = await searchParams
  const [transactions, formData] = await Promise.all([
    getTransactions({
      search: params.search,
      type: params.type,
      account_id: params.account_id,
      category_id: params.category_id,
      date_from: params.date_from,
      date_to: params.date_to,
    }),
    getFormData(),
  ])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Extrato</h1>
          <p className="text-cn-on-surface-variant mt-1">Histórico completo de transações</p>
        </div>
        <Link
          href="/nova-transacao"
          className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity text-sm"
        >
          + Nova
        </Link>
      </div>

      {/* Filters */}
      <ExtratoFilters
        accounts={formData.accounts}
        categories={formData.categories.filter((c: { parent_id: string | null }) => !c.parent_id)}
        initialFilters={params}
      />

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <Receipt className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhuma transação encontrada</h3>
          <p className="text-sm text-cn-on-surface-variant mb-6">
            {params.search || params.type || params.account_id
              ? 'Tente ajustar os filtros de busca.'
              : 'Crie sua primeira transação para começar a acompanhar suas finanças.'}
          </p>
          <Link
            href="/nova-transacao"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Nova Transação
          </Link>
        </div>
      ) : (
        <div className="glass rounded-3xl p-4 sm:p-6">
          <div className="space-y-1">
            {transactions.map((tx: {
              id: string
              type: string
              amount: number
              description: string
              transaction_date: string
              is_paid: boolean
              account: { name: string; color: string } | null
              category: { name: string; icon: string; color: string } | null
              tags: Array<{ tag: { id: string; name: string; color: string } }>
            }) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl hover:bg-cn-surface-container-high/40 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${
                    tx.type === 'receita' ? 'bg-cn-secondary/15' : 'bg-cn-tertiary/15'
                  }`}>
                    {tx.type === 'receita'
                      ? <ArrowUpRight className="w-5 h-5 text-cn-secondary" />
                      : <ArrowDownRight className="w-5 h-5 text-cn-tertiary" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cn-on-surface truncate">{tx.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-cn-on-surface-variant">{tx.category?.name ?? '—'}</span>
                      {tx.account && (
                        <>
                          <span className="text-cn-on-surface-variant/30">·</span>
                          <span className="text-xs text-cn-on-surface-variant">{tx.account.name}</span>
                        </>
                      )}
                      {tx.tags?.map(({ tag }) => (
                        <span
                          key={tag.id}
                          className="text-[10px] px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className={`text-sm font-semibold ${
                    tx.type === 'receita' ? 'text-cn-secondary' : 'text-cn-on-surface'
                  }`}>
                    {tx.type === 'receita' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                  </p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <p className="text-xs text-cn-on-surface-variant">{formatDate(tx.transaction_date)}</p>
                    {tx.is_paid && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cn-secondary/10 text-cn-secondary">pago</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
