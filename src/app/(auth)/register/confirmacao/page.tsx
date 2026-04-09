'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, RefreshCw, Wallet, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default function ConfirmacaoPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleResend = async () => {
    setResending(true)
    setError('')
    setResent(false)

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setResent(true)
    }
    setResending(false)
  }

  return (
    <div className="glass rounded-3xl p-8 shadow-celestial text-center">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
          <Wallet className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-cn-on-surface tracking-tight">CABAN</h1>
      </div>

      {/* Mail Icon */}
      <div className="w-20 h-20 rounded-full bg-cn-primary/15 flex items-center justify-center mx-auto mb-6">
        <Mail className="w-10 h-10 text-cn-primary" />
      </div>

      <h2 className="text-xl font-semibold text-cn-on-surface mb-2">
        Verifique seu e-mail
      </h2>

      <p className="text-sm text-cn-on-surface-variant mb-2">
        Enviamos um link de confirmação para:
      </p>

      <p className="text-sm font-semibold text-cn-primary mb-6">
        {email}
      </p>

      <p className="text-sm text-cn-on-surface-variant mb-8">
        Clique no link enviado para ativar sua conta e começar a usar o CABAN. 
        Verifique também a caixa de spam.
      </p>

      {/* Resend */}
      {resent ? (
        <div className="flex items-center justify-center gap-2 text-cn-secondary text-sm mb-6">
          <CheckCircle className="w-4 h-4" />
          E-mail reenviado com sucesso!
        </div>
      ) : (
        <button
          onClick={handleResend}
          disabled={resending || !email}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-cn-surface-container-high/50 text-cn-on-surface-variant hover:text-cn-on-surface hover:bg-cn-surface-container-high transition-all font-medium text-sm disabled:opacity-50 mb-6"
        >
          <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
          {resending ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
        </button>
      )}

      {error && (
        <p className="text-cn-error text-sm mb-4">{error}</p>
      )}

      <Link
        href="/login"
        className="text-sm text-cn-primary hover:underline font-medium"
      >
        ← Voltar para o login
      </Link>
    </div>
  )
}
