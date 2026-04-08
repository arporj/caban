'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Receipt,
  PlusCircle,
  Target,
  Wallet,
  CreditCard,
  Tags,
  FolderTree,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Extrato', href: '/extrato', icon: Receipt },
  { label: 'Nova Transação', href: '/nova-transacao', icon: PlusCircle },
  { label: 'Planejamento', href: '/planejamento', icon: Target },
]

const cadastrosNav = [
  { label: 'Contas', href: '/contas', icon: Wallet },
  { label: 'Cartões', href: '/cartoes', icon: CreditCard },
  { label: 'Categorias', href: '/categorias', icon: FolderTree },
  { label: 'Tags', href: '/tags', icon: Tags },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isActive = (href: string) => pathname === href

  const NavItem = ({ item }: { item: typeof mainNav[0] }) => (
    <Link
      href={item.href}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200
        ${isActive(item.href)
          ? 'bg-cn-primary/15 text-cn-primary glow-primary'
          : 'text-cn-on-surface-variant hover:text-cn-on-surface hover:bg-cn-surface-container-high/50'
        }
        ${collapsed ? 'justify-center px-3' : ''}
      `}
    >
      <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive(item.href) ? 'text-cn-primary' : ''}`} />
      {!collapsed && (
        <span className="text-sm font-medium truncate">{item.label}</span>
      )}
    </Link>
  )

  return (
    <aside
      className={`
        h-screen sticky top-0 flex flex-col
        bg-cn-surface-container-low/80 backdrop-blur-xl
        transition-all duration-300 ease-out
        ${collapsed ? 'w-[72px]' : 'w-[260px]'}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-5 py-6 ${collapsed ? 'justify-center px-3' : ''}`}>
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <span className="text-xl font-bold text-cn-on-surface tracking-tight">CABAN</span>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="space-y-1">
          {mainNav.map((item) => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Cadastros */}
        <div className="pt-6">
          {!collapsed && (
            <p className="px-4 pb-2 text-xs font-medium text-cn-on-surface-variant/60 uppercase tracking-widest">
              Cadastros
            </p>
          )}
          <div className="space-y-1">
            {cadastrosNav.map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-1">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-cn-on-surface-variant hover:text-cn-on-surface hover:bg-cn-surface-container-high/50 transition-all"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span className="text-sm font-medium">Recolher</span>}
        </button>

        <Link
          href="/configuracoes"
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-cn-on-surface-variant hover:text-cn-on-surface hover:bg-cn-surface-container-high/50 transition-all ${collapsed ? 'justify-center px-3' : ''}`}
        >
          <Settings className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Configurações</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl w-full text-cn-error/70 hover:text-cn-error hover:bg-cn-error/10 transition-all ${collapsed ? 'justify-center px-3' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  )
}
