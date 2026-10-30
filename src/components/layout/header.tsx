'use client'

import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Sun, Moon, Bell } from 'lucide-react'

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-xl flex items-center justify-between px-6 flex-shrink-0">
      <div />
      <div className="flex items-center gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Alternar tema"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </motion.button>
      </div>
    </header>
  )
}
