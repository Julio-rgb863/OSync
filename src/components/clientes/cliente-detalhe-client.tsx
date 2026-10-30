'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Edit, Phone, Mail, MapPin, Monitor, FileText } from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatCurrency, TIPO_EQUIPAMENTO } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'

export function ClienteDetalheClient({ cliente }: { cliente: any }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-lg border border-border hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
              <span className="text-white font-bold text-lg">{cliente.nome.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">{cliente.nome}</h1>
              <p className="text-muted-foreground text-sm">
                {cliente._count?.ordens ?? cliente.ordens?.length} OS · {cliente._count?.equipamentos ?? cliente.equipamentos?.length} Equipamentos
              </p>
            </div>
          </div>
        </div>
        <Link href={`/clientes/${cliente.id}/editar`}>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm">
            <Edit className="w-4 h-4" /> Editar
          </motion.button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card space-y-3">
            <h3 className="text-sm font-semibold">Contato</h3>
            {cliente.email && <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-muted-foreground" />{cliente.email}</div>}
            {cliente.telefone && <div className="flex items-center gap-2 text-sm"><Phone className="w-4 h-4 text-muted-foreground" />{cliente.telefone}</div>}
            {cliente.cpfCnpj && <div className="flex items-center gap-2 text-sm text-muted-foreground">CPF/CNPJ: {cliente.cpfCnpj}</div>}
            {cliente.cidade && <div className="flex items-center gap-2 text-sm"><MapPin className="w-4 h-4 text-muted-foreground" />{cliente.cidade}/{cliente.estado}</div>}
          </div>

          {/* Equipamentos */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> Equipamentos</h3>
            </div>
            {cliente.equipamentos.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum equipamento</p>
            ) : (
              <div className="space-y-2">
                {cliente.equipamentos.map((e: any) => (
                  <div key={e.id} className="text-sm p-2 rounded-lg bg-muted">
                    <p className="font-medium">{TIPO_EQUIPAMENTO[e.tipo as keyof typeof TIPO_EQUIPAMENTO]?.icon} {e.marca} {e.modelo}</p>
                    {e.numeroSerie && <p className="text-xs text-muted-foreground">S/N: {e.numeroSerie}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* OS */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="font-semibold">Ordens de Serviço</h3>
            </div>
            {cliente.ordens.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">Nenhuma OS cadastrada</div>
            ) : (
              <div className="divide-y divide-border">
                {cliente.ordens.map((os: any) => (
                  <Link key={os.id} href={`/ordens/${os.id}`}>
                    <motion.div whileHover={{ backgroundColor: 'rgba(99,102,241,0.04)' }} className="flex items-center justify-between px-5 py-3.5 cursor-pointer">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm text-primary font-semibold">#{String(os.numero).padStart(4, '0')}</span>
                          <StatusBadge status={os.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{os.descricaoProblema?.slice(0, 60)}...</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(os.valorTotal)}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(os.createdAt)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
