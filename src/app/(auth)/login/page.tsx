'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Wallet } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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

        {error && (
          <p className="text-cn-error text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      <p className="text-sm text-cn-on-surface-variant text-center mt-6">
        Não tem uma conta?{' '}
        <Link href="/register" className="text-cn-primary hover:underline font-medium">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
