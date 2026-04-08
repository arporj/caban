'use client'

import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, ArrowLeftRight } from 'lucide-react'

type TransactionType = 'despesa' | 'receita' | 'transferencia'
type RecurrenceMode = 'unica' | 'fixa' | 'parcelada'

export default function NovaTransacaoPage() {
  const [type, setType] = useState<TransactionType>('despesa')
  const [recurrenceMode, setRecurrenceMode] = useState<RecurrenceMode>('unica')
  const [installmentValueMode, setInstallmentValueMode] = useState<'por_parcela' | 'total'>('total')

  const typeOptions = [
    { value: 'despesa' as const, label: 'Despesa', icon: ArrowDownRight, color: 'cn-tertiary' },
    { value: 'receita' as const, label: 'Receita', icon: ArrowUpRight, color: 'cn-secondary' },
    { value: 'transferencia' as const, label: 'Transferência', icon: ArrowLeftRight, color: 'cn-primary' },
  ]

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Nova Transação</h1>
        <p className="text-cn-on-surface-variant mt-1">Registre um novo lançamento</p>
      </div>

      <div className="glass rounded-3xl p-8 space-y-6">
        {/* Type Selector */}
        <div className="flex gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all
                ${type === opt.value
                  ? `bg-${opt.color}/15 text-${opt.color} ring-1 ring-${opt.color}/30`
                  : 'text-cn-on-surface-variant hover:bg-cn-surface-container-high/50'
                }
              `}
            >
              <opt.icon className="w-4 h-4" />
              {opt.label}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Valor (R$) *
          </label>
          <input
            type="text"
            placeholder="0,00"
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface text-2xl font-bold placeholder:text-cn-on-surface-variant/30 focus:outline-none focus:ring-2 focus:ring-cn-primary/40"
          />
        </div>

        {/* Date + Recurrence */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Data *
            </label>
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Repetição
            </label>
            <select
              value={recurrenceMode}
              onChange={(e) => setRecurrenceMode(e.target.value as RecurrenceMode)}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
            >
              <option value="unica">Única</option>
              <option value="fixa">Fixa</option>
              <option value="parcelada">Parcelada</option>
            </select>
          </div>
        </div>

        {/* Recurrence Options */}
        {recurrenceMode !== 'unica' && (
          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-cn-surface-container/60">
            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                Periodicidade *
              </label>
              <select className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm">
                <option value="dia">Diária</option>
                <option value="semana">Semanal</option>
                <option value="mes" selected>Mensal</option>
                <option value="ano">Anual</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                {recurrenceMode === 'fixa' ? 'Repete a cada N *' : 'Nº de parcelas *'}
              </label>
              <input
                type="number"
                min={1}
                defaultValue={recurrenceMode === 'fixa' ? 1 : 2}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
              />
            </div>

            {/* Installment value mode */}
            {recurrenceMode === 'parcelada' && (
              <div className="col-span-2">
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                  O valor informado é
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setInstallmentValueMode('total')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${installmentValueMode === 'total'
                        ? 'bg-cn-primary/15 text-cn-primary ring-1 ring-cn-primary/30'
                        : 'text-cn-on-surface-variant hover:bg-cn-surface-container-high/50'
                      }
                    `}
                  >
                    Valor Total
                  </button>
                  <button
                    onClick={() => setInstallmentValueMode('por_parcela')}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all
                      ${installmentValueMode === 'por_parcela'
                        ? 'bg-cn-primary/15 text-cn-primary ring-1 ring-cn-primary/30'
                        : 'text-cn-on-surface-variant hover:bg-cn-surface-container-high/50'
                      }
                    `}
                  >
                    Valor por Parcela
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Descrição
          </label>
          <input
            type="text"
            placeholder="Ex: Supermercado"
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
          />
        </div>

        {/* Account + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Conta *
            </label>
            <select className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm">
              <option value="">Selecione...</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
              Categoria *
            </label>
            <select className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm">
              <option value="">Selecione...</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Observações
          </label>
          <textarea
            rows={3}
            placeholder="Observações adicionais..."
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm resize-none"
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Tags
          </label>
          <input
            type="text"
            placeholder="Adicionar tags..."
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
            Salvar
          </button>
          <button className="w-12 h-12 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface hover:bg-cn-surface-container-high transition-all flex items-center justify-center text-xl font-bold">
            +
          </button>
        </div>
      </div>
    </div>
  )
}
