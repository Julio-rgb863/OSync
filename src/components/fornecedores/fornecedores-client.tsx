'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Truck, Plus, Search, Star, Clock, Mail, Phone,
  Building2, Trash2, Edit3, Check, Filter,
} from 'lucide-react'

export interface FornecedorItem {
  id: string
  razaoSocial: string
  nomeFantasia?: string | null
  cnpj?: string | null
  email?: string | null
  telefone?: string | null
  categoria: string
  prazoEntregaDias: number
  avaliacao: number
  condicaoPagamento?: string | null
  endereco?: string | null
  cidade?: string | null
  estado?: string | null
  ativo: boolean
  observacoes?: string | null
  _count?: { pedidos: number }
}

interface Props {
  fornecedoresIniciais: FornecedorItem[]
  podeEditar: boolean
  isAdmin: boolean
}

const CATEGORIAS = [
  { value: 'TODAS', label: 'Todas as Categorias' },
  { value: 'PECAS', label: 'Peças & Componentes' },
  { value: 'EQUIPAMENTOS', label: 'Equipamentos & Máquinas' },
  { value: 'SERVICOS', label: 'Serviços Especializados' },
  { value: 'MATERIAIS', label: 'Insumos & Materiais' },
]

export function FornecedoresClient({
  fornecedoresIniciais,
  podeEditar,
  isAdmin,
}: Props) {
  const [fornecedores, setFornecedores] = useState<FornecedorItem[]>(fornecedoresIniciais)
  const [busca, setBusca] = useState('')
  const [categoriaFiltro, setCategoriaFiltro] = useState('TODAS')
  const [modalAberto, setModalAberto] = useState(false)
  const [editando, setEditando] = useState<FornecedorItem | null>(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Form states
  const [razaoSocial, setRazaoSocial] = useState('')
  const [nomeFantasia, setNomeFantasia] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [categoria, setCategoria] = useState('PECAS')
  const [prazoEntregaDias, setPrazoEntregaDias] = useState<number>(3)
  const [avaliacao, setAvaliacao] = useState<number>(5.0)
  const [condicaoPagamento, setCondicaoPagamento] = useState('30 Dias')
  const [endereco, setEndereco] = useState('')
  const [cidade, setCidade] = useState('')
  const [estado, setEstado] = useState('')
  const [observacoes, setObservacoes] = useState('')

  const filtrados = fornecedores.filter((f) => {
    const matchCat = categoriaFiltro === 'TODAS' || f.categoria === categoriaFiltro
    const matchBusca =
      !busca ||
      f.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
      (f.nomeFantasia && f.nomeFantasia.toLowerCase().includes(busca.toLowerCase())) ||
      (f.cnpj && f.cnpj.includes(busca)) ||
      (f.email && f.email.toLowerCase().includes(busca.toLowerCase()))

    return matchCat && matchBusca
  })

  // Executive metrics
  const totalAtivos = fornecedores.length
  const mediaAvaliacao =
    fornecedores.length > 0
      ? (fornecedores.reduce((acc, f) => acc + f.avaliacao, 0) / fornecedores.length).toFixed(1)
      : '5.0'
  const mediaPrazo =
    fornecedores.length > 0
      ? Math.round(fornecedores.reduce((acc, f) => acc + f.prazoEntregaDias, 0) / fornecedores.length)
      : 3

  function abrirNovo() {
    setEditando(null)
    setRazaoSocial('')
    setNomeFantasia('')
    setCnpj('')
    setEmail('')
    setTelefone('')
    setCategoria('PECAS')
    setPrazoEntregaDias(3)
    setAvaliacao(5.0)
    setCondicaoPagamento('30 Dias')
    setEndereco('')
    setCidade('')
    setEstado('')
    setObservacoes('')
    setErro('')
    setModalAberto(true)
  }

  function abrirEditar(f: FornecedorItem) {
    setEditando(f)
    setRazaoSocial(f.razaoSocial)
    setNomeFantasia(f.nomeFantasia || '')
    setCnpj(f.cnpj || '')
    setEmail(f.email || '')
    setTelefone(f.telefone || '')
    setCategoria(f.categoria)
    setPrazoEntregaDias(f.prazoEntregaDias)
    setAvaliacao(f.avaliacao)
    setCondicaoPagamento(f.condicaoPagamento || '30 Dias')
    setEndereco(f.endereco || '')
    setCidade(f.cidade || '')
    setEstado(f.estado || '')
    setObservacoes(f.observacoes || '')
    setErro('')
    setModalAberto(true)
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!razaoSocial.trim()) {
      setErro('Informe a Razão Social do fornecedor.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const url = editando ? `/api/fornecedores/${editando.id}` : '/api/fornecedores'
      const method = editando ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razaoSocial,
          nomeFantasia: nomeFantasia || null,
          cnpj: cnpj || null,
          email: email || null,
          telefone: telefone || null,
          categoria,
          prazoEntregaDias: Number(prazoEntregaDias),
          avaliacao: Number(avaliacao),
          condicaoPagamento: condicaoPagamento || null,
          endereco: endereco || null,
          cidade: cidade || null,
          estado: estado || null,
          observacoes: observacoes || null,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erro ao salvar fornecedor')
      }

      const itemSalvo = await res.json()

      if (editando) {
        setFornecedores(fornecedores.map((f) => (f.id === editando.id ? itemSalvo : f)))
      } else {
        setFornecedores([itemSalvo, ...fornecedores])
      }

      setModalAberto(false)
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleExcluir(id: string) {
    if (!isAdmin) return
    if (!confirm('Deseja desativar este fornecedor? Ele será removido das buscas ativas.')) return

    try {
      const res = await fetch(`/api/fornecedores/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Falha ao desativar fornecedor')

      setFornecedores(fornecedores.filter((f) => f.id !== id))
    } catch (err: any) {
      alert(err.message || 'Erro ao desativar')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
              Módulo ERP
            </span>
            <span className="text-xs text-muted-foreground font-mono">Suprimentos & Compras</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground mt-1">
            Gestão de Fornecedores & Cadeia de Suprimentos
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cadastro qualificado de parceiros comerciais, avaliação de SLA de entrega e condições contratuais.
          </p>
        </div>

        {podeEditar && (
          <button
            onClick={abrirNovo}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-subtle flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Fornecedor
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Fornecedores Homologados</span>
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
            {totalAtivos}
          </div>
          <p className="text-[11px] text-muted-foreground">Parceiros ativos na base</p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Avaliação Geral (SLA)</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
            {mediaAvaliacao} <span className="text-xs text-muted-foreground font-sans">/ 5.0</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Índice ponderado de pontualidade</p>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Lead Time Médio</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-semibold tracking-tight text-foreground font-mono">
            {mediaPrazo} dias
          </div>
          <p className="text-[11px] text-muted-foreground">Prazo médio de atendimento de pedidos</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3 rounded-lg border border-border bg-card shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por razão social, CNPJ ou email..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {CATEGORIAS.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fornecedores Table */}
      <div className="rounded-lg border border-border bg-card shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                <th className="py-2.5 px-4">Fornecedor / Razão Social</th>
                <th className="py-2.5 px-4">CNPJ & Localização</th>
                <th className="py-2.5 px-4">Categoria</th>
                <th className="py-2.5 px-4">SLA / Avaliação</th>
                <th className="py-2.5 px-4">Lead Time</th>
                <th className="py-2.5 px-4">Condição</th>
                <th className="py-2.5 px-4 text-center w-24">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Truck className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-xs font-medium">Nenhum fornecedor cadastrado.</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Cadastre novos parceiros de suprimentos para vincular a compras e peças.
                    </p>
                  </td>
                </tr>
              ) : (
                filtrados.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors group text-foreground">
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground tracking-[-0.01em]">
                        {item.razaoSocial}
                      </div>
                      {item.nomeFantasia && (
                        <div className="text-[11px] text-muted-foreground">{item.nomeFantasia}</div>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                        {item.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-2.5 h-2.5" />
                            {item.email}
                          </span>
                        )}
                        {item.telefone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5" />
                            {item.telefone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-muted-foreground text-[11px]">
                      <div>{item.cnpj || '—'}</div>
                      {(item.cidade || item.estado) && (
                        <div className="text-[10px] text-muted-foreground font-sans">
                          {[item.cidade, item.estado].filter(Boolean).join(' - ')}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border uppercase">
                        {item.categoria}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-amber-500 font-semibold font-mono text-[11px]">
                        <Star className="w-3 h-3 fill-amber-500" />
                        {item.avaliacao.toFixed(1)}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground">
                      {item.prazoEntregaDias} dias
                    </td>

                    <td className="py-3 px-4 text-muted-foreground text-[11px]">
                      {item.condicaoPagamento || 'À Vista'}
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="inline-flex items-center gap-1">
                        {podeEditar && (
                          <button
                            onClick={() => abrirEditar(item)}
                            className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                            title="Editar Fornecedor"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleExcluir(item.id)}
                            className="p-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
                            title="Desativar Fornecedor"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      <AnimatePresence>
        {modalAberto && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-card border border-border rounded-lg shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">
                    {editando ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
                  </h2>
                </div>
                <button
                  onClick={() => setModalAberto(false)}
                  className="text-muted-foreground hover:text-foreground text-xs p-1 rounded"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSalvar} className="p-5 space-y-4">
                {erro && (
                  <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs">
                    {erro}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Razão Social *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Dell Computadores Ltda"
                      value={razaoSocial}
                      onChange={(e) => setRazaoSocial(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dell Brasil"
                      value={nomeFantasia}
                      onChange={(e) => setNomeFantasia(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      placeholder="00.000.000/0001-00"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Categoria de Suprimento
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="PECAS">Peças & Componentes</option>
                      <option value="EQUIPAMENTOS">Equipamentos & Máquinas</option>
                      <option value="SERVICOS">Serviços Especializados</option>
                      <option value="MATERIAIS">Insumos & Materiais</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      E-mail Comercial
                    </label>
                    <input
                      type="email"
                      placeholder="vendas@fornecedor.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      placeholder="(11) 98765-4321"
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Lead Time (dias)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={prazoEntregaDias}
                      onChange={(e) => setPrazoEntregaDias(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Nota SLA (1 a 5)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={1}
                      max={5}
                      value={avaliacao}
                      onChange={(e) => setAvaliacao(Number(e.target.value))}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Condição de Pagamento
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 30D / À Vista"
                      value={condicaoPagamento}
                      onChange={(e) => setCondicaoPagamento(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md border border-border transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-subtle disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Fornecedor'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
