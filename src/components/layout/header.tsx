'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Bell, Search, CheckCircle2 } from 'lucide-react'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-12 border-b border-border bg-background flex items-center justify-between px-4 flex-shrink-0 select-none">
      {/* Left: Organization / Branch & Global Quick Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">OSync Enterprise</span>
          <span className="text-border">/</span>
          <span className="hover:text-foreground cursor-pointer transition-colors">Matriz Principal</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground w-64 cursor-pointer hover:border-muted-foreground/40 transition-colors">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 text-[11px] truncate">Buscar OS, cliente, peça...</span>
          <kbd className="text-[10px] font-mono border border-border rounded px-1 bg-background text-muted-foreground">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Operational Status, Notifications & Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Sync Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sincronizado
        </div>

        {/* Notifications */}
        <button
          className="relative p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Notificações"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-primary rounded-full" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}
