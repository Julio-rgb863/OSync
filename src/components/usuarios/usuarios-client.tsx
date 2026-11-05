'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ROLE_LABELS, formatDate } from '@/lib/utils'

interface Usuario {
  id: string
  name: string
  email: string
  role: string
  ativo: boolean
  createdAt: string
  _count: { ordens: number }
}

interface Props {
  usuarios: Usuario[]
}

const ROLES = ['ADMIN', 'TECNICO', 'ATENDENTE']

const emptyForm = { name: '', email: '', password: '', role: 'ATENDENTE' }

const roleColor: Record<string, string> = {
  ADMIN: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  TECNICO: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  ATENDENTE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}

export function UsuariosClient({ usuarios: initial }: Props) {
  const [usuarios, setUsuarios] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  function abrirNovo() {
    setEditando(null)
    setForm(emptyForm)
    setErro('')
    setModalOpen(true)
  }

  function abrirEditar(u: Usuario) {
    setEditando(u)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setErro('')
    setModalOpen(true)
  }

  async function salvar() {
    if (!form.name.trim()) { setErro('Nome obrigatório'); return }
    if (!form.email.trim()) { setErro('E-mail obrigatório'); return }
    if (!editando && !form.password) { setErro('Senha obrigatória para novo usuário'); return }

    setLoading(true)
    setErro('')

    const url = editando ? `/api/usuarios/${editando.id}` : '/api/usuarios'
    const method = editando ? 'PUT' : 'POST'
    const body = editando
      ? { name: form.name, email: form.email, role: form.role, ...(form.password ? { password: form.password } : {}) }
      : form

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()

    if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setLoading(false); return }

    if (editando) {
      setUsuarios(usuarios.map((u) => (u.id === editando.id ? { ...u, ...data } : u)))
    } else {
      setUsuarios([...usuarios, { ...data, _count: { ordens: 0 } }])
    }

    setModalOpen(false)
    setLoading(false)
  }

  async function desativar(id: string) {
    if (!confirm('Desativar este usuário?')) return
    const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' })
    if (res.ok) setUsuarios(usuarios.filter((u) => u.id !== id))
    else {
      const d = await res.json()
      alert(d.error ?? 'Erro ao desativar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuários</h1>
          <p className="text-muted-foreground text-sm">{usuarios.length} usuários cadastrados</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          <span className="text-lg leading-none">+</span> Novo Usuário
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {usuarios.map((u) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg">
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{u.name}</p>
                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${roleColor[u.role] ?? 'bg-muted text-muted-foreground border-border'}`}>
                    {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] ?? u.role}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {u._count.ordens} OS
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Desde {formatDate(u.createdAt)}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => abrirEditar(u)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={() => desativar(u.id)}
                className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Desativar
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 className="text-lg font-bold">{editando ? 'Editar Usuário' : 'Novo Usuário'}</h2>

              {erro && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{erro}</p>}

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground">Nome completo *</label>
                  <input
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="João Silva"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">E-mail *</label>
                  <input
                    type="email"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="joao@empresa.com"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">
                    Senha {editando ? '(deixe em branco para não alterar)' : '*'}
                  </label>
                  <input
                    type="password"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder={editando ? '••••••••' : 'Mínimo 8 caracteres'}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Perfil *</label>
                  <select
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r as keyof typeof ROLE_LABELS]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted/50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  onClick={salvar}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editando ? 'Atualizar' : 'Criar Usuário'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
