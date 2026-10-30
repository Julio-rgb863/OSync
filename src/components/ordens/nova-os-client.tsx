'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Save, User, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

const schema = z.object({
  clienteId: z.string().min(1, 'Selecione um cliente'),
  equipamentoId: z.string().optional(),
  tecnicoId: z.string().optional(),
  prioridade: z.string().min(1, 'Prioridade obrigatória'),
  descricaoProblema: z.string().min(10, 'Descreva o problema (mínimo 10 caracteres)'),
  dataPrazo: z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props { clientes: any[]; tecnicos: any[] }

export function NovaOSClient({ clientes, tecnicos }: Props) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const router = useRouter()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { prioridade: 'MEDIA' },
  })

  const clienteId = watch('clienteId')
  useEffect(() => {
    if (clienteId) {
      fetch(`/api/equipamentos?clienteId=${clienteId}`)
        .then(r => r.json())
        .then(d => setEquipamentos(Array.isArray(d) ? d : []))
        .catch(() => setEquipamentos([]))
    } else setEquipamentos([])
  }, [clienteId])

  const onSubmit = async (data: FormData) => {
    setLoading(true); setMsg('')
    try {
      const res = await fetch('/api/ordens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      const os = await res.json()
      router.push(`/ordens/${os.id}`)
      router.refresh()
    } catch {
      setMsg('Erro ao criar OS. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const sel = 'w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/ordens">
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-lg border border-border hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
          <p className="text-muted-foreground text-sm">Preencha as informações da OS</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-primary"><User className="w-4 h-4" /> Cliente e Equipamento</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Cliente *</label>
            <select {...register('clienteId')} className={sel}>
              <option value="">Selecione um cliente...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            {errors.clienteId && <p className="text-xs text-destructive mt-1">{errors.clienteId.message}</p>}
          </div>
          {equipamentos.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">Equipamento</label>
              <select {...register('equipamentoId')} className={sel}>
                <option value="">Selecione o equipamento...</option>
                {equipamentos.map(e => <option key={e.id} value={e.id}>{e.marca} {e.modelo} ({e.tipo})</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Técnico Responsável</label>
            <select {...register('tecnicoId')} className={sel}>
              <option value="">Não atribuído</option>
              {tecnicos.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <h3 className="text-sm font-semibold flex items-center gap-2 text-primary"><AlertTriangle className="w-4 h-4" /> Problema e Prioridade</h3>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Prioridade</label>
            <select {...register('prioridade')} className={sel}>
              <option value="BAIXA">🟢 Baixa</option>
              <option value="MEDIA">🔵 Média</option>
              <option value="ALTA">🟡 Alta</option>
              <option value="URGENTE">🔴 Urgente</option>
            </select>
            {errors.prioridade && <p className="text-xs text-destructive mt-1">{errors.prioridade.message}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Descrição do Problema *</label>
            <textarea {...register('descricaoProblema')} rows={5} className={sel} placeholder="Descreva detalhadamente o problema relatado pelo cliente..." />
            {errors.descricaoProblema && <p className="text-xs text-destructive mt-1">{errors.descricaoProblema.message}</p>}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Prazo</label>
            <input {...register('dataPrazo')} type="date" className={sel} />
          </div>
        </div>

        {msg && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{msg}</p>}

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            Abrir OS
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
