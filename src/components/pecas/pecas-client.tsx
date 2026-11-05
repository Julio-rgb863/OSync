'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface Peca {
  id: string
  nome: string
  codigo?: string | null
  descricao?: string | null
  quantidade: number
  estoqueMinimo: number
  precoCompra: number
  precoVenda: number
  fornecedor?: string | null
  localizacao?: string | null
  ativo: boolean
}

interface Props {
  pecas: Peca[]
  podeEditar: boolean
}

const emptyForm = {
  nome: '',
  codigo: '',
  descricao: '',
  quantidade: 0,
  estoqueMinimo: 1,
  precoCompra: 0,
  precoVenda: 0,
  fornecedor: '',
  localizacao: '',
}

export function PecasClient({ pecas: initialPecas, podeEditar }: Props) {
  const [pecas, setPecas] = useState(initialPecas)
  const [q, setQ] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editando, setEditando] = useState<Peca | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const filtered = pecas.filter(
    (p) =>
      p.nome.toLowerCase().includes(q.toLowerCase()) ||
      (p.codigo ?? '').toLowerCase().includes(q.toLowerCase()) ||
      (p.fornecedor ?? '').toLowerCase().includes(q.toLowerCase())
  )

  const baixoEstoque = pecas.filter((p) => p.quantidade <= p.estoqueMinimo)

  function abrirNovo() {
    setEditando(null)
    setForm(emptyForm)
    setErro('')
    setModalOpen(true)
  }

  function abrirEditar(p: Peca) {
    setEditando(p)
    setForm({
      nome: p.nome,
      codigo: p.codigo ?? '',
      descricao: p.descricao ?? '',
      quantidade: p.quantidade,
      estoqueMinimo: p.estoqueMinimo,
      precoCompra: p.precoCompra,
      precoVenda: p.precoVenda,
      fornecedor: p.fornecedor ?? '',
      localizacao: p.localizacao ?? '',
    })
    setErro('')
    setModalOpen(true)
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Nome obrigatório'); return }
    setLoading(true)
    setErro('')

    const payload = {
      ...form,
      quantidade: Number(form.quantidade),
      estoqueMinimo: Number(form.estoqueMinimo),
      precoCompra: Number(form.precoCompra),
      precoVenda: Number(form.precoVenda),
    }

    const url = editando ? `/api/pecas/${editando.id}` : '/api/pecas'
    const method = editando ? 'PUT' : 'POST'

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const data = await res.json()

    if (!res.ok) { setErro(data.error ?? 'Erro ao salvar'); setLoading(false); return }

    if (editando) {
      setPecas(pecas.map((p) => (p.id === editando.id ? { ...p, ...data } : p)))
    } else {
      setPecas([...pecas, data])
    }
    setModalOpen(false)
    setLoading(false)
  }

  async function excluir(id: string) {
    if (!confirm('Desativar esta peça?')) return
    const res = await fetch(`/api/pecas/${id}`, { method: 'DELETE' })
    if (res.ok) setPecas(pecas.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Peças / Estoque</h1>
          <p className="text-muted-foreground text-sm">
            {pecas.length} itens · {baixoEstoque.length} com estoque baixo
          </p>
        </div>
        {podeEditar && (
          <button
            onClick={abrirNovo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            <span className="text-lg leading-none">+</span> Nova Peça
          </button>
        )}
      </div>

      {/* Alerta estoque baixo */}
      {baixoEstoque.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          ⚠️ <strong>{baixoEstoque.length} item(s)</strong> com estoque abaixo do mínimo:{' '}
          {baixoEstoque.map((p) => p.nome).join(', ')}
        </div>
      )}

      {/* Busca */}
      <input
        type="text"
        placeholder="Buscar por nome, código ou fornecedor..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full max-w-sm px-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      {/* Tabela */}
      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Código', 'Nome / Descrição', 'Estoque', 'Mín.', 'Pr. Compra', 'Pr. Venda', 'Localização', 'Status', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  Nenhuma peça encontrada
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const baixo = p.quantidade <= p.estoqueMinimo
                return (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.codigo || '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium">{p.nome}</p>
                      {p.descricao && <p className="text-xs text-muted-foreground">{p.descricao}</p>}
                      {p.fornecedor && <p className="text-xs text-muted-foreground">Forn: {p.fornecedor}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-sm font-bold ${baixo ? 'text-red-400' : 'text-emerald-400'}`}>
                        {p.quantidade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{p.estoqueMinimo}</td>
                    <td className="px-4 py-3 text-sm">{formatCurrency(p.precoCompra)}</td>
                    <td className="px-4 py-3 text-sm font-medium text-primary">{formatCurrency(p.precoVenda)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{p.localizacao || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-1 rounded-full border ${
                          baixo
                            ? 'bg-red-500/10 text-red-400 border-red-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {baixo ? '⚠ Baixo' : '✓ OK'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {podeEditar && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirEditar(p)}
                            className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => excluir(p.id)}
                            className="text-xs px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Remover
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
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
              className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h2 className="text-lg font-bold">{editando ? 'Editar Peça' : 'Nova Peça'}</h2>

              {erro && <p className="text-sm text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{erro}</p>}

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Nome *</label>
                  <input
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Ex: HD SSD 480GB"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Código</label>
                  <input
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    placeholder="SKU-001"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Localização</label>
                  <input
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.localizacao}
                    onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                    placeholder="Prateleira A2"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Descrição</label>
                  <input
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.descricao}
                    onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Quantidade</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.quantidade}
                    onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Estoque Mínimo</label>
                  <input
                    type="number"
                    min={0}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.estoqueMinimo}
                    onChange={(e) => setForm({ ...form, estoqueMinimo: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Preço de Compra (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.precoCompra}
                    onChange={(e) => setForm({ ...form, precoCompra: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Preço de Venda (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.precoVenda}
                    onChange={(e) => setForm({ ...form, precoVenda: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-muted-foreground">Fornecedor</label>
                  <input
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={form.fornecedor}
                    onChange={(e) => setForm({ ...form, fornecedor: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
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
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
