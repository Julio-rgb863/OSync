'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft, FileText, User, Monitor, Package,
  MessageSquare, History, ChevronRight, Send, CheckCircle,
} from 'lucide-react'
import Link from 'next/link'
import { formatDateTime, formatCurrency, STATUS_OS, TIPO_EQUIPAMENTO, PRIORIDADE_OS } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import { useRouter } from 'next/navigation'

const STATUS_ORDER = ['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA', 'CONCLUIDA', 'ENTREGUE']

interface Props { ordem: any; userRole: string; userId: string }

export function OSDetailClient({ ordem: init, userRole, userId }: Props) {
  const [ordem, setOrdem] = useState(init)
  const [tab, setTab] = useState('detalhes')
  const [comentario, setComentario] = useState('')
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [loadingComment, setLoadingComment] = useState(false)
  const router = useRouter()

  const canEdit = userRole === 'ADMIN' || userRole === 'TECNICO'

  const changeStatus = async (status: string) => {
    if (!canEdit || status === ordem.status) return
    setLoadingStatus(true)
    try {
      const res = await fetch(`/api/ordens/${ordem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error()
      setOrdem({ ...ordem, status })
      router.refresh()
    } finally { setLoadingStatus(false) }
  }

  const sendComment = async () => {
    if (!comentario.trim()) return
    setLoadingComment(true)
    try {
      await fetch(`/api/ordens/${ordem.id}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: comentario }),
      })
      setComentario('')
      router.refresh()
    } finally { setLoadingComment(false) }
  }

  const tabs = [
    { id: 'detalhes', label: 'Detalhes', icon: FileText },
    { id: 'historico', label: 'Histórico', icon: History },
    { id: 'comentarios', label: 'Comentários', icon: MessageSquare },
    { id: 'pecas', label: 'Peças', icon: Package },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/ordens">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-lg border border-border hover:bg-muted">
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold font-mono">OS #{String(ordem.numero).padStart(4, '0')}</h1>
              <StatusBadge status={ordem.status} showPulse />
              {PRIORIDADE_OS[ordem.prioridade as keyof typeof PRIORIDADE_OS] && (
                <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORIDADE_OS[ordem.prioridade as keyof typeof PRIORIDADE_OS].bg} ${PRIORIDADE_OS[ordem.prioridade as keyof typeof PRIORIDADE_OS].text}`}>
                  {PRIORIDADE_OS[ordem.prioridade as keyof typeof PRIORIDADE_OS].label}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">Aberta em {formatDateTime(ordem.createdAt)}</p>
          </div>
        </div>
        <Link href={`/ordens/${ordem.id}/pdf`} target="_blank">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border text-sm hover:bg-muted">
            <FileText className="w-4 h-4" /> PDF
          </motion.button>
        </Link>
      </div>

      {/* Status stepper */}
      {canEdit && (
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground mb-3 font-medium tracking-wider">PROGRESSO</p>
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_ORDER.map((s, i) => {
              const cur = STATUS_ORDER.indexOf(ordem.status)
              const isActive = s === ordem.status
              const isPast = i < cur
              const cfg = STATUS_OS[s as keyof typeof STATUS_OS]
              return (
                <div key={s} className="flex items-center gap-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={() => changeStatus(s)}
                    disabled={isActive || loadingStatus}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive ? `${cfg.bg} ${cfg.text} ${cfg.border} border` :
                      isPast ? 'bg-muted/50 text-muted-foreground/50 line-through' :
                      'border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {isActive && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse" />}
                    {cfg.label}
                  </motion.button>
                  {i < STATUS_ORDER.length - 1 && <ChevronRight className="w-3 h-3 text-muted-foreground/40" />}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-0 border-b border-border">
            {tabs.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}>
                <t.icon className="w-4 h-4" />{t.label}
              </button>
            ))}
          </div>

          {tab === 'detalhes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-sm font-semibold mb-3">Descrição do Problema</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ordem.descricaoProblema}</p>
              </div>
              {ordem.laudoTecnico && (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-emerald-400">
                    <CheckCircle className="w-4 h-4" /> Laudo Técnico
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ordem.laudoTecnico}</p>
                </div>
              )}
            </motion.div>
          )}

          {tab === 'historico' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              {ordem.historicos.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhum histórico</p>
              ) : (
                ordem.historicos.map((h: any, i: number) => (
                  <div key={h.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      {i < ordem.historicos.length - 1 && <div className="w-0.5 flex-1 bg-border mt-1 min-h-4" />}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{h.user?.name}</span>
                        {h.statusAnterior && h.statusNovo && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <StatusBadge status={h.statusAnterior} className="text-xs" />
                            <ChevronRight className="w-3 h-3" />
                            <StatusBadge status={h.statusNovo} className="text-xs" />
                          </span>
                        )}
                      </div>
                      {h.observacao && <p className="text-sm text-muted-foreground mt-0.5">{h.observacao}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{formatDateTime(h.createdAt)}</p>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {tab === 'comentarios' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <div className="space-y-3">
                {ordem.comentarios.map((c: any) => (
                  <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{c.user?.name}</span>
                      <span className="text-xs text-muted-foreground">{formatDateTime(c.createdAt)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{c.texto}</p>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <textarea value={comentario} onChange={e => setComentario(e.target.value)} rows={2}
                  placeholder="Adicione um comentário..." className="flex-1 px-3 py-2 rounded-lg bg-muted border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={sendComment} disabled={loadingComment || !comentario.trim()}
                  className="px-4 py-2 rounded-lg bg-primary text-white disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {tab === 'pecas' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              {ordem.pecas.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">Nenhuma peça adicionada</p>
              ) : (
                <div className="rounded-xl border border-border bg-card overflow-hidden">
                  <table className="w-full">
                    <thead><tr className="border-b border-border bg-muted/50">
                      {['Peça', 'Qtd', 'Unit.', 'Total'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>)}
                    </tr></thead>
                    <tbody className="divide-y divide-border">
                      {ordem.pecas.map((p: any) => (
                        <tr key={p.id}>
                          <td className="px-4 py-3 text-sm font-medium">{p.peca.nome}</td>
                          <td className="px-4 py-3 text-sm">{p.quantidade}</td>
                          <td className="px-4 py-3 text-sm">{formatCurrency(p.precoUnitario)}</td>
                          <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(p.quantidade * p.precoUnitario)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Cliente</h3>
            <p className="font-medium">{ordem.cliente?.nome}</p>
            {ordem.cliente?.email && <p className="text-sm text-muted-foreground">{ordem.cliente.email}</p>}
            {ordem.cliente?.telefone && <p className="text-sm text-muted-foreground">{ordem.cliente.telefone}</p>}
            <Link href={`/clientes/${ordem.clienteId}`} className="text-xs text-primary hover:underline mt-2 block">Ver perfil →</Link>
          </div>

          {ordem.equipamento && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Monitor className="w-4 h-4 text-primary" /> Equipamento</h3>
              <p className="font-medium">{TIPO_EQUIPAMENTO[ordem.equipamento.tipo as keyof typeof TIPO_EQUIPAMENTO]?.icon} {ordem.equipamento.marca} {ordem.equipamento.modelo}</p>
              {ordem.equipamento.numeroSerie && <p className="text-xs text-muted-foreground mt-1">S/N: {ordem.equipamento.numeroSerie}</p>}
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Técnico</h3>
            {ordem.tecnico ? <p className="text-sm">{ordem.tecnico.name}</p> : <p className="text-sm text-muted-foreground">Não atribuído</p>}
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-semibold mb-3">Financeiro</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Serviço</span><span>{formatCurrency(ordem.valorServico)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Peças</span><span>{formatCurrency(ordem.valorPecas)}</span></div>
              <div className="flex justify-between text-sm font-semibold border-t border-border pt-2">
                <span>Total</span><span className="text-primary">{formatCurrency(ordem.valorTotal)}</span>
              </div>
            </div>
            {ordem.aprovadoPeloCliente && (
              <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Orçamento aprovado
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
