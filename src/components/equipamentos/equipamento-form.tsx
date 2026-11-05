'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Monitor } from 'lucide-react'
import Link from 'next/link'
import { TIPO_EQUIPAMENTO } from '@/lib/utils'

interface Cliente { id: string; nome: string }

interface Props {
  clientes: Cliente[]
  initialData?: {
    clienteId: string
    tipo: string
    marca?: string
    modelo?: string
    numeroSerie?: string
    descricao?: string
    senha?: string
    acessorios?: string
  }
  equipamentoId?: string
}

export function EquipamentoForm({ clientes, initialData, equipamentoId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    clienteId: initialData?.clienteId ?? '',
    tipo: initialData?.tipo ?? 'OUTRO',
    marca: initialData?.marca ?? '',
    modelo: initialData?.modelo ?? '',
    numeroSerie: initialData?.numeroSerie ?? '',
    descricao: initialData?.descricao ?? '',
    senha: initialData?.senha ?? '',
    acessorios: initialData?.acessorios ?? '',
  })

  const inp = 'w-full px-3 py-2.5 rounded-lg bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.clienteId) { setMsg('Selecione um cliente'); return }
    setLoading(true)
    setMsg('')
    try {
      const url = equipamentoId ? `/api/equipamentos/${equipamentoId}` : '/api/equipamentos'
      const method = equipamentoId ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      router.push('/equipamentos')
      router.refresh()
    } catch {
      setMsg('Erro ao salvar equipamento. Tente novamente.')
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/equipamentos">
          <motion.button type="button" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-lg border border-border hover:bg-muted">
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{equipamentoId ? 'Editar Equipamento' : 'Novo Equipamento'}</h1>
          <p className="text-muted-foreground text-sm">Preencha os dados do equipamento</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4 text-primary">
              <Monitor className="w-4 h-4" /> Dados do Equipamento
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">Cliente *</label>
                <select
                  value={form.clienteId}
                  onChange={(e) => setForm({ ...form, clienteId: e.target.value })}
                  className={inp}
                >
                  <option value="">Selecione o cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">Tipo *</label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(TIPO_EQUIPAMENTO).map(([key, { label, icon }]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setForm({ ...form, tipo: key })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-colors ${
                        form.tipo === key
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border hover:bg-muted text-muted-foreground'
                      }`}
                    >
                      <span className="text-xl">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Marca</label>
                <input
                  value={form.marca}
                  onChange={(e) => setForm({ ...form, marca: e.target.value })}
                  className={inp}
                  placeholder="Dell, Apple, Samsung..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Modelo</label>
                <input
                  value={form.modelo}
                  onChange={(e) => setForm({ ...form, modelo: e.target.value })}
                  className={inp}
                  placeholder="Inspiron 15, MacBook Air..."
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Número de Série</label>
                <input
                  value={form.numeroSerie}
                  onChange={(e) => setForm({ ...form, numeroSerie: e.target.value })}
                  className={inp}
                  placeholder="SN-00000"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Senha / PIN</label>
                <input
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  className={inp}
                  placeholder="Senha informada pelo cliente"
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">Descrição / Configuração</label>
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  rows={3}
                  className={inp}
                  placeholder="Processador, RAM, HD, outros detalhes..."
                />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1.5 block">Acessórios recebidos</label>
                <input
                  value={form.acessorios}
                  onChange={(e) => setForm({ ...form, acessorios: e.target.value })}
                  className={inp}
                  placeholder="Carregador, mouse, bolsa..."
                />
              </div>
            </div>
          </div>

          {msg && <p className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">{msg}</p>}
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {equipamentoId ? 'Atualizar' : 'Salvar'} Equipamento
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}
