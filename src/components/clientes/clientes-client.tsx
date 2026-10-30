'use client'

import { motion } from 'framer-motion'
import { Users, Plus, Search, Phone, Mail, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatDate } from '@/lib/utils'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

export function ClientesClient({ clientes }: { clientes: any[] }) {
  const [search, setSearch] = useState('')

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.telefone?.includes(search)
  )

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-muted-foreground text-sm">{clientes.length} clientes cadastrados</p>
        </div>
        <Link href="/clientes/novo">
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Novo Cliente
          </motion.button>
        </Link>
      </motion.div>

      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, email ou telefone..."
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((c) => (
          <motion.div key={c.id} variants={item}>
            <Link href={`/clientes/${c.id}`}>
              <motion.div
                whileHover={{ y: -4 }} transition={{ duration: 0.2 }}
                className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-bold">{c.nome.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{c.nome}</p>
                    {c.email && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{c.email}</p>
                      </div>
                    )}
                    {c.telefone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">{c.telefone}</p>
                      </div>
                    )}
                    {c.cidade && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground">{c.cidade}/{c.estado}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <p className="text-lg font-bold text-primary">{c._count.ordens}</p>
                    <p className="text-xs text-muted-foreground">OS</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold">{c._count.equipamentos}</p>
                    <p className="text-xs text-muted-foreground">Equipamentos</p>
                  </div>
                  <div className="ml-auto text-xs text-muted-foreground">{formatDate(c.createdAt)}</div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}
