'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Wallet, ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="glass rounded-3xl p-8 shadow-celestial">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-cn-on-surface tracking-tight">CABAN</h1>
        </div>

        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-cn-secondary/10 flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-cn-secondary" />
          </div>
          <h2 className="text-lg font-semibold text-cn-on-surface">
            E-mail enviado!
          </h2>
          <p className="text-sm text-cn-on-surface-variant leading-relaxed">
            Enviamos um link de redefinição de senha para{' '}
            <span className="text-cn-primary font-medium">{email}</span>.
            <br />
            Verifique sua caixa de entrada e a pasta de spam.
          </p>
          <div className="flex items-center justify-center gap-2 text-cn-on-surface-variant/60 text-xs pt-2">
            <Mail className="w-4 h-4" />
            O link expira em 1 hora
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-cn-primary text-sm font-medium hover:underline mt-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <div className="glass rounded-3xl p-8 shadow-celestial">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-cn-on-surface tracking-tight">CABAN</h1>
      </div>

      <h2 className="text-lg font-semibold text-cn-on-surface text-center mb-1">
        Esqueceu sua senha?
      </h2>
      <p className="text-sm text-cn-on-surface-variant text-center mb-8">
        Informe seu e-mail e enviaremos um link para redefinir sua senha
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            E-mail
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 transition-all"
            placeholder="seu@email.com"
            required
          />
        </div>

        {error && (
          <div className="rounded-xl bg-cn-error/10 p-4">
            <p className="text-cn-error text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar link de redefinição'}
        </button>
      </form>

      <Link
        href="/login"
        className="flex items-center justify-center gap-2 text-cn-on-surface-variant text-sm hover:text-cn-on-surface transition-colors mt-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar ao login
      </Link>
    </div>
  )
}
