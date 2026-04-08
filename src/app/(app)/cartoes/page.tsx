'use client'

import { useState, useEffect } from 'react'
import { CreditCard, Plus, X, Pencil, Trash2 } from 'lucide-react'
import { getCreditCards, createCreditCard, updateCreditCard, deleteCreditCard, type CreditCardFormData } from './actions'
import { getAccounts } from '../contas/actions'

const brands = [
  { value: 'visa' as const, label: 'Visa' },
  { value: 'mastercard' as const, label: 'Mastercard' },
  { value: 'elo' as const, label: 'Elo' },
  { value: 'amex' as const, label: 'Amex' },
  { value: 'hipercard' as const, label: 'Hipercard' },
  { value: 'outro' as const, label: 'Outro' },
]

const cardColors = [
  '#ff6daf', '#ba9eff', '#53ddfc', '#ae8dff', '#8455ef',
  '#4ade80', '#facc15', '#f97316', '#ef4444', '#06b6d4',
]

type CardType = {
  id: string
  name: string
  brand: string
  color: string
  closing_day: number
  due_day: number
  credit_limit: number
  payment_account_id: string | null
  is_active: boolean
}

type Account = {
  id: string
  name: string
}

export default function CartoesPage() {
  const [cards, setCards] = useState<CardType[]>([])
  const [accounts, setAccounts] = useState<Account[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState('')
  const [brand, setBrand] = useState<CreditCardFormData['brand']>('visa')
  const [color, setColor] = useState('#ff6daf')
  const [closingDay, setClosingDay] = useState('1')
  const [dueDay, setDueDay] = useState('10')
  const [creditLimit, setCreditLimit] = useState('')
  const [paymentAccountId, setPaymentAccountId] = useState<string>('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [cardsData, accountsData] = await Promise.all([getCreditCards(), getAccounts()])
      setCards(cardsData)
      setAccounts(accountsData)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  function resetForm() {
    setName(''); setBrand('visa'); setColor('#ff6daf')
    setClosingDay('1'); setDueDay('10'); setCreditLimit('')
    setPaymentAccountId(''); setEditingId(null); setShowForm(false)
  }

  function startEdit(card: CardType) {
    setName(card.name); setBrand(card.brand as CreditCardFormData['brand'])
    setColor(card.color); setClosingDay(String(card.closing_day))
    setDueDay(String(card.due_day)); setCreditLimit(String(card.credit_limit))
    setPaymentAccountId(card.payment_account_id ?? '')
    setEditingId(card.id); setShowForm(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const formData: CreditCardFormData = {
        name, brand, color,
        closing_day: parseInt(closingDay),
        due_day: parseInt(dueDay),
        credit_limit: parseFloat(creditLimit || '0'),
        payment_account_id: paymentAccountId || null,
      }
      if (editingId) { await updateCreditCard(editingId, formData) }
      else { await createCreditCard(formData) }
      resetForm()
      await loadData()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Excluir este cartão?')) return
    try { await deleteCreditCard(id); await loadData() }
    catch (e) { console.error(e) }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-cn-on-surface tracking-tight">Cartões de Crédito</h1>
          <p className="text-cn-on-surface-variant mt-1">Gerencie seus cartões e faturas</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-5 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          Novo Cartão
        </button>
      </div>

      {showForm && (
        <div className="glass rounded-3xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-cn-on-surface">{editingId ? 'Editar Cartão' : 'Novo Cartão'}</h3>
            <button onClick={resetForm} className="text-cn-on-surface-variant hover:text-cn-on-surface"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Nome *</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                  placeholder="Ex: Nubank Visa" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Bandeira *</label>
                <select value={brand} onChange={(e) => setBrand(e.target.value as CreditCardFormData['brand'])}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm">
                  {brands.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Fecha dia *</label>
                <input type="number" min={1} max={31} value={closingDay} onChange={(e) => setClosingDay(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Vence dia *</label>
                <input type="number" min={1} max={31} value={dueDay} onChange={(e) => setDueDay(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Limite (R$)</label>
                <input type="number" step="0.01" value={creditLimit} onChange={(e) => setCreditLimit(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm"
                  placeholder="0,00" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Débito automático na conta</label>
              <select value={paymentAccountId} onChange={(e) => setPaymentAccountId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface focus:outline-none focus:ring-2 focus:ring-cn-primary/40 text-sm">
                <option value="">Nenhuma</option>
                {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {cardColors.map((c) => (
                  <button key={c} type="button" onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-cn-surface ring-cn-primary scale-110' : 'hover:scale-110'}`}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
                {saving ? 'Salvando...' : editingId ? 'Salvar' : 'Criar Cartão'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-6 py-3 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors font-medium">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="glass rounded-3xl p-12 text-center"><p className="text-cn-on-surface-variant">Carregando...</p></div>
      ) : cards.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <CreditCard className="w-16 h-16 text-cn-on-surface-variant/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-cn-on-surface mb-2">Nenhum cartão cadastrado</h3>
          <p className="text-sm text-cn-on-surface-variant">Adicione um cartão de crédito para acompanhar suas faturas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card) => (
            <div key={card.id} className="rounded-3xl p-6 hover:shadow-celestial transition-all group relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${card.color}25 0%, ${card.color}10 100%)` }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-10" style={{ backgroundColor: card.color, transform: 'translate(30%,-30%)' }} />
              <div className="flex items-start justify-between mb-6 relative">
                <div>
                  <p className="text-sm font-bold text-cn-on-surface">{card.name}</p>
                  <p className="text-xs text-cn-on-surface-variant capitalize">{brands.find(b => b.value === card.brand)?.label}</p>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => startEdit(card)} className="p-2 rounded-lg hover:bg-white/10 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(card.id)} className="p-2 rounded-lg hover:bg-cn-error/10 text-cn-on-surface-variant hover:text-cn-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="flex justify-between items-end relative">
                <div>
                  <p className="text-xs text-cn-on-surface-variant">Limite</p>
                  <p className="text-lg font-bold text-cn-on-surface">{card.credit_limit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-cn-on-surface-variant">Fecha dia {card.closing_day}</p>
                  <p className="text-xs text-cn-on-surface-variant">Vence dia {card.due_day}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
