'use client'

import { useState, useEffect } from 'react'
import { Wallet, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { getAccounts, createAccount, updateAccount, deleteAccount, type AccountFormData } from './actions'

const accountTypes = [
  { value: 'corrente', label: 'Conta Corrente' },
  { value: 'poupanca', label: 'Poupança' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'investimento', label: 'Investimento' },
] as const

const accountColors = [
  '#ba9eff', '#53ddfc', '#ff6daf', '#ae8dff', '#8455ef',
  '#4ade80', '#facc15', '#f97316', '#ef4444', '#06b6d4',
]

type Account = {
  id: string
  name: string
  type: string
  color: string
  icon: string
  initial_balance: number
  is_active: boolean
  sort_order: number
}

export default function ContasPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountFormData['type']>('corrente')
  const [color, setColor] = useState('#ba9eff')
  const [initialBalance, setInitialBalance] = useState('')

  useEffect(() => {
    loadAccounts()
  }, [])

  async function loadAccounts() {
    setLoading(true)
    try {
      const data = await getAccounts()
      setAccounts(data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function resetForm() {
    setName('')
    setType('corrente')
    setColor('#ba9eff')
    setInitialBalance('')
    setEditingId(null)
    setShowForm(false)
  }

  function startEdit(account: Account) {
    setName(account.name)
    setType(account.type as AccountFormData['type'])
    setColor(account.color)
    setInitialBalance(String(account.initial_balance))
    setEditingId(account.id)
    setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const formData: AccountFormData = {
        name,
        type,
        color,
        icon: 'wallet',
        initial_balance: parseFloat(initialBalance || '0'),
      }

      if (editingId) {
        await updateAccount(editingId, formData)
      } else {
        await createAccount(formData)
      }
      resetForm()
      await loadAccounts()
    } catch (e) {
      console.error(e)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta conta?')) return
    try {
      await deleteAccount(id)
      await loadAccounts()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Contas</h1>
          <p className="text-cn-on-surface-variant mt-1">Gerencie suas contas bancárias</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nova Conta
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cn-on-surface">
              {editingId ? 'Editar Conta' : 'Nova Conta'}
            </h3>
            <button onClick={resetForm} className="text-cn-on-surface-variant hover:text-cn-on-surface">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                  Nome *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                  placeholder="Ex: Nubank"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                  Tipo *
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as AccountFormData['type'])}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                >
                  {accountTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                Saldo Inicial (R$)
              </label>
              <input
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={(e) => setInitialBalance(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                placeholder="0,00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
                Cor
              </label>
              <div className="flex gap-2 flex-wrap">
                {accountColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-cn-surface ring-cn-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Conta'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Accounts List */}
      {loading ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-cn-on-surface-variant">Carregando...</p>
        </div>
      ) : accounts.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <Wallet className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhuma conta cadastrada</h3>
          <p className="text-sm text-cn-on-surface-variant">Adicione sua primeira conta para começar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <div key={account.id} className="glass rounded-3xl p-5 hover:shadow-celestial transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${account.color}20` }}
                  >
                    <Wallet className="w-5 h-5" style={{ color: account.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-cn-on-surface">{account.name}</p>
                    <p className="text-xs text-cn-on-surface-variant capitalize">
                      {accountTypes.find(t => t.value === account.type)?.label ?? account.type}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => startEdit(account)}
                    className="p-2 rounded-lg hover:bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 rounded-lg hover:bg-cn-error/10 text-cn-on-surface-variant hover:text-cn-error transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xl font-bold text-cn-on-surface">
                {account.initial_balance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-xs text-cn-on-surface-variant mt-1">Saldo inicial</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
