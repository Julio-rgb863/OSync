'use client'

import { motion } from 'framer-motion'
import { FileText, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { formatDate, formatCurrency, STATUS_OS, TIPO_EQUIPAMENTO } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'

const STATUS_FILTERS = ['Todos', 'ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'ENTREGUE', 'CANCELADA']

export function OrdensClient({ ordens }: { ordens: any[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')

  const filtered = ordens.filter(os => {
    const s = !search || os.cliente?.nome.toLowerCase().includes(search.toLowerCase()) ||
      String(os.numero).includes(search) || os.descricaoProblema.toLowerCase().includes(search.toLowerCase())
    const st = statusFilter === 'Todos' || os.status === statusFilter
    return s && st
  })

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ordens de Serviço</h1>
          <p className="text-muted-foreground text-sm">{ordens.length} ordens no total</p>
        </div>
        <Link href="/ordens/nova">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium">
            <Plus className="w-4 h-4" /> Nova OS
          </motion.button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por cliente, número ou problema..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
              {s === 'Todos' ? 'Todos' : STATUS_OS[s as keyof typeof STATUS_OS]?.label || s}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {['Nº OS', 'Cliente', 'Equipamento', 'Status', 'Técnico', 'Valor', 'Data'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((os) => (
                <motion.tr key={os.id} whileHover={{ backgroundColor: 'rgba(99,102,241,0.03)' }}
                  className="cursor-pointer" onClick={() => window.location.href = `/ordens/${os.id}`}>
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-primary font-semibold">#{String(os.numero).padStart(4, '0')}</span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{os.cliente?.nome}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {os.equipamento ? `${TIPO_EQUIPAMENTO[os.equipamento.tipo as keyof typeof TIPO_EQUIPAMENTO]?.icon} ${os.equipamento.marca} ${os.equipamento.modelo}` : '—'}
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={os.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{os.tecnico?.name || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium">{formatCurrency(os.valorTotal)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(os.createdAt)}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-16 text-center text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" /><p>Nenhuma ordem encontrada</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
