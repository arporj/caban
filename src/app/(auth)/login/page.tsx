'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Wallet, RefreshCw, Mail } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setEmailNotConfirmed(false)
    setResent(false)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Detectando se o erro é de e-mail não confirmado
      const msg = error.message.toLowerCase()
      if (msg.includes('email not confirmed') || msg.includes('email_not_confirmed')) {
        setEmailNotConfirmed(true)
        setError('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada (e spam).')
      } else if (msg.includes('invalid login credentials') || msg.includes('invalid_credentials')) {
        // Pode ser senha errada OU e-mail não confirmado (Supabase retorna o mesmo erro)
        // Vamos tentar detectar se o usuário existe verificando com signUp
        setEmailNotConfirmed(true)
        setError('E-mail ou senha inválidos. Se você acabou de se cadastrar, verifique se confirmou o e-mail.')
      } else {
        setError(error.message)
      }
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const handleResendConfirmation = async () => {
    setResending(true)
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
      setError('')
    }
    setResending(false)
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
        Bem-vindo de volta
      </h2>
      <p className="text-sm text-cn-on-surface-variant text-center mb-8">
        Entre para gerenciar suas finanças
      </p>

      <form onSubmit={handleLogin} className="space-y-5">
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

        <div>
          <label className="block text-xs font-medium text-cn-on-surface-variant uppercase tracking-wider mb-2">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-cn-surface-container-low text-cn-on-surface placeholder:text-cn-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-cn-primary/40 transition-all pr-12"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-cn-on-surface-variant hover:text-cn-on-surface transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Erro com contexto de confirmação */}
        {error && (
          <div className="rounded-xl bg-cn-error/10 p-4 space-y-3">
            <p className="text-cn-error text-sm">{error}</p>

            {emailNotConfirmed && email && (
              <>
                {resent ? (
                  <div className="flex items-center gap-2 text-cn-secondary text-xs">
                    <Mail className="w-4 h-4" />
                    E-mail de confirmação reenviado para {email}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="flex items-center gap-2 text-cn-primary text-xs font-medium hover:underline disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Reenviando...' : 'Reenviar e-mail de confirmação'}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <div className="text-center mt-4">
        <Link
          href="/esqueci-senha"
          className="text-xs text-cn-on-surface-variant hover:text-cn-primary transition-colors"
        >
          Esqueceu sua senha?
        </Link>
      </div>

      <p className="text-sm text-cn-on-surface-variant text-center mt-4">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-cn-primary hover:underline font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
