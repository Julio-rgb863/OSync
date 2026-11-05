'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, ROLE_LABELS } from '@/lib/utils'
import {
  LayoutDashboard, Users, Monitor, FileText,
  Package, UserCog, Settings, ChevronLeft, ChevronRight,
  LogOut, Shield,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Logo } from '@/components/shared/logo'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  roles: string[]
  shortcut?: string
}

interface NavSection {
  heading: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    heading: 'Workspace Operacional',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'TECNICO', 'ATENDENTE'], shortcut: '⌘1' },
      { title: 'Ordens de Serviço', href: '/ordens', icon: FileText, roles: ['ADMIN', 'TECNICO', 'ATENDENTE'], shortcut: '⌘2' },
    ],
  },
  {
    heading: 'Suprimentos & Ativos',
    items: [
      { title: 'Equipamentos', href: '/equipamentos', icon: Monitor, roles: ['ADMIN', 'TECNICO', 'ATENDENTE'], shortcut: '⌘3' },
      { title: 'Peças & Estoque', href: '/pecas', icon: Package, roles: ['ADMIN', 'TECNICO'], shortcut: '⌘4' },
    ],
  },
  {
    heading: 'Comercial & CRM',
    items: [
      { title: 'Clientes', href: '/clientes', icon: Users, roles: ['ADMIN', 'TECNICO', 'ATENDENTE'], shortcut: '⌘5' },
    ],
  },
  {
    heading: 'Governança',
    items: [
      { title: 'Usuários & Acessos', href: '/usuarios', icon: UserCog, roles: ['ADMIN'], shortcut: '⌘8' },
      { title: 'Configurações', href: '/configuracoes', icon: Settings, roles: ['ADMIN', 'TECNICO', 'ATENDENTE'], shortcut: '⌘9' },
    ],
  },
]

interface SidebarProps {
  userRole?: string
  userName?: string
}

export function Sidebar({ userRole = 'ATENDENTE', userName = 'Usuário' }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ width: 240 }}
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col h-screen border-r border-border bg-[#F8FAFC] dark:bg-card overflow-hidden flex-shrink-0 select-none"
    >
      {/* Brand Header */}
      <div className="flex items-center h-12 px-4 border-b border-border bg-background">
        <Logo size={24} showWordmark={!collapsed} />
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto">
        {navSections.map((section) => {
          const visibleItems = section.items.filter((item) => item.roles.includes(userRole))
          if (visibleItems.length === 0) return null

          return (
            <div key={section.heading} className="space-y-0.5">
              {!collapsed && (
                <div className="px-2 pb-1 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                  {section.heading}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                const Icon = item.icon

                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={cn(
                        'flex items-center justify-between gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors duration-150 group cursor-pointer',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium dark:bg-primary/15'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
                      )}
                      title={collapsed ? item.title : undefined}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                        {!collapsed && (
                          <span className="truncate tracking-[-0.01em]">{item.title}</span>
                        )}
                      </div>

                      {!collapsed && item.shortcut && (
                        <kbd className="hidden group-hover:inline-block text-[10px] text-muted-foreground/60 font-mono">
                          {item.shortcut}
                        </kbd>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {/* User Footer */}
      <div className="p-2 border-t border-border bg-background">
        <div className="flex items-center gap-2.5 p-1.5 rounded-md hover:bg-muted/60 transition-colors">
          <div className="w-7 h-7 rounded bg-muted flex items-center justify-center flex-shrink-0 text-foreground font-semibold text-xs border border-border">
            {userName.charAt(0).toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate leading-tight">{userName}</p>
              <p className="text-[10px] text-muted-foreground truncate leading-tight">
                {ROLE_LABELS[userRole as keyof typeof ROLE_LABELS] || userRole}
              </p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Encerrar sessão"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute right-2 top-3 w-5 h-5 rounded border border-border bg-background flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-subtle"
        title={collapsed ? 'Expandir' : 'Recolher'}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </motion.aside>
  )
}
