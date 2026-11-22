'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, ArrowUpRight, ArrowDownRight, Plus, Search,
  Calendar, CheckCircle2, Clock, AlertTriangle, Trash2,
  FileText, Filter, Receipt, ChevronDown, Check,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export interface TituloItem {
  id: string
  tipo: string // 'RECEITA' | 'DESPESA'
  categoria: string
  descricao: string
  valor: number
  dataVencimento: string
  dataPagamento?: string | null
  status: string // 'PENDENTE' | 'PAGO' | 'CANCELADO' | 'ATRASADO'
  formaPagamento?: string | null
  documento?: string | null
  osId?: string | null
  clienteId?: string | null
  fornecedor?: string | null
  observacoes?: string | null
  os?: { numero: number } | null
}

export interface ResumoFinanceiro {
  totalReceitas: number
  aReceber: number
  totalDespesas: number
  aPagar: number
  saldoRealizado: number
  saldoProjetado: number
}

interface Props {
  titulosIniciais: TituloItem[]
  resumoInicial: ResumoFinanceiro
  podeEditar: boolean
  isAdmin: boolean
}

const CATEGORIAS_RECEITA = [
  { value: 'SERVICOS', label: 'Serviços Prestados' },
  { value: 'PECAS', label: 'Venda de Peças' },
  { value: 'CONTRATO', label: 'Contrato Recorrente' },
  { value: 'OUTROS', label: 'Outras Receitas' },
]

const CATEGORIAS_DESPESA = [
  { value: 'FORNECEDORES', label: 'Fornecedores & Peças' },
  { value: 'FOLHA', label: 'Folha & Pessoal' },
  { value: 'INFRAESTRUTURA', label: 'Infraestrutura & Nuvem' },
  { value: 'IMPOSTOS', label: 'Tributos & Encargos' },
  { value: 'OUTROS', label: 'Outras Despesas' },
]

const FORMAS_PAGAMENTO = [
  { value: 'PIX', label: 'PIX Instantâneo' },
  { value: 'BOLETO', label: 'Boleto Bancário' },
  { value: 'CARTAO', label: 'Cartão Corporativo' },
  { value: 'TRANSFERENCIA', label: 'Transferência / TED' },
  { value: 'DINHEIRO', label: 'Dinheiro em Espécie' },
]

export function FinanceiroClient({
  titulosIniciais,
  resumoInicial,
  podeEditar,
  isAdmin,
}: Props) {
  const [titulos, setTitulos] = useState<TituloItem[]>(titulosIniciais)
  const [resumo, setResumo] = useState<ResumoFinanceiro>(resumoInicial)
  const [busca, setBusca] = useState('')
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS')
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS')
  const [modalNovo, setModalNovo] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  // Form State
  const [formTipo, setFormTipo] = useState<'RECEITA' | 'DESPESA'>('RECEITA')
  const [formDescricao, setFormDescricao] = useState('')
  const [formValor, setFormValor] = useState<number | ''>('')
  const [formCategoria, setFormCategoria] = useState('SERVICOS')
  const [formDataVencimento, setFormDataVencimento] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [formStatus, setFormStatus] = useState<'PENDENTE' | 'PAGO'>('PENDENTE')
  const [formFormaPagamento, setFormFormaPagamento] = useState('PIX')
  const [formDocumento, setFormDocumento] = useState('')
  const [formFornecedor, setFormFornecedor] = useState('')
  const [formObservacoes, setFormObservacoes] = useState('')

  // Recalculate summary from local titulos list
  function recalcularResumo(lista: TituloItem[]): ResumoFinanceiro {
    const totalReceitas = lista
      .filter((t) => t.tipo === 'RECEITA' && t.status === 'PAGO')
      .reduce((acc, t) => acc + t.valor, 0)

    const aReceber = lista
      .filter((t) => t.tipo === 'RECEITA' && t.status === 'PENDENTE')
      .reduce((acc, t) => acc + t.valor, 0)

    const totalDespesas = lista
      .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
      .reduce((acc, t) => acc + t.valor, 0)

    const aPagar = lista
      .filter((t) => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
      .reduce((acc, t) => acc + t.valor, 0)

    const saldoRealizado = totalReceitas - totalDespesas
    const saldoProjetado = saldoRealizado + (aReceber - aPagar)

    return {
      totalReceitas,
      aReceber,
      totalDespesas,
      aPagar,
      saldoRealizado,
      saldoProjetado,
    }
  }

  // Filtered Titles
  const titulosFiltrados = titulos.filter((t) => {
    const matchTipo = filtroTipo === 'TODOS' || t.tipo === filtroTipo
    const matchStatus = filtroStatus === 'TODOS' || t.status === filtroStatus
    const matchBusca =
      !busca ||
      t.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (t.documento && t.documento.toLowerCase().includes(busca.toLowerCase())) ||
      (t.fornecedor && t.fornecedor.toLowerCase().includes(busca.toLowerCase())) ||
      (t.os && `OS #${t.os.numero}`.toLowerCase().includes(busca.toLowerCase()))

    return matchTipo && matchStatus && matchBusca
  })

  function abrirModalNovo() {
    setFormTipo('RECEITA')
    setFormDescricao('')
    setFormValor('')
    setFormCategoria('SERVICOS')
    setFormDataVencimento(new Date().toISOString().split('T')[0])
    setFormStatus('PENDENTE')
    setFormFormaPagamento('PIX')
    setFormDocumento('')
    setFormFornecedor('')
    setFormObservacoes('')
    setErro('')
    setModalNovo(true)
  }

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    if (!formDescricao.trim() || !formValor || Number(formValor) <= 0) {
      setErro('Preencha a descrição e um valor positivo válido.')
      return
    }

    setLoading(true)
    setErro('')

    try {
      const res = await fetch('/api/financeiro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: formTipo,
          categoria: formCategoria,
          descricao: formDescricao,
          valor: Number(formValor),
          dataVencimento: new Date(formDataVencimento).toISOString(),
          status: formStatus,
          formaPagamento: formFormaPagamento,
          documento: formDocumento.trim() || null,
          fornecedor: formFornecedor.trim() || null,
          observacoes: formObservacoes.trim() || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Erro ao criar lançamento financeiro')
      }

      const novo = await res.json()
      const novaLista = [novo, ...titulos]
      setTitulos(novaLista)
      setResumo(recalcularResumo(novaLista))
      setModalNovo(false)
    } catch (err: any) {
      setErro(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  async function handleBaixar(id: string) {
    if (!podeEditar) return

    try {
      const res = await fetch(`/api/financeiro/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PAGO' }),
      })

      if (!res.ok) throw new Error('Falha ao liquidar título')

      const atualizado = await res.json()
      const novaLista = titulos.map((t) => (t.id === id ? { ...t, ...atualizado } : t))
      setTitulos(novaLista)
      setResumo(recalcularResumo(novaLista))
    } catch (err: any) {
      alert(err.message || 'Erro ao liquidar')
    }
  }

  async function handleExcluir(id: string) {
    if (!isAdmin) return
    if (!confirm('Deseja realmente remover este lançamento? A operação gerará registro no log de auditoria.')) {
      return
    }

    try {
      const res = await fetch(`/api/financeiro/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) throw new Error('Falha ao excluir título financeiro')

      const novaLista = titulos.filter((t) => t.id !== id)
      setTitulos(novaLista)
      setResumo(recalcularResumo(novaLista))
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
              Módulo ERP
            </span>
            <span className="text-xs text-muted-foreground font-mono">Controladoria & DRE</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground mt-1">
            Gestão Financeira & Fluxo de Caixa
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Demonstrativo de receitas, provisões de despesas, conciliação e concorrência com Ordens de Serviço.
          </p>
        </div>

        {podeEditar && (
          <button
            onClick={abrirModalNovo}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-subtle flex-shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Lançamento
          </button>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Receita Realizada */}
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Receitas Realizadas</span>
            <div className="w-6 h-6 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-semibold tracking-tight text-foreground font-mono">
            {formatCurrency(resumo.totalReceitas)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            A receber: <span className="font-mono text-foreground font-medium">{formatCurrency(resumo.aReceber)}</span>
          </p>
        </div>

        {/* Despesas Pagas */}
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Despesas Pagas</span>
            <div className="w-6 h-6 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-semibold tracking-tight text-foreground font-mono">
            {formatCurrency(resumo.totalDespesas)}
          </div>
          <p className="text-[11px] text-muted-foreground">
            A pagar: <span className="font-mono text-foreground font-medium">{formatCurrency(resumo.aPagar)}</span>
          </p>
        </div>

        {/* Saldo Líquido Realizado */}
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Saldo Realizado</span>
            <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-xl font-semibold tracking-tight font-mono ${
              resumo.saldoRealizado >= 0
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(resumo.saldoRealizado)}
          </div>
          <p className="text-[11px] text-muted-foreground">Caixa efetivamente apurado</p>
        </div>

        {/* Saldo Projetado */}
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Saldo Projetado</span>
            <div className="w-6 h-6 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div
            className={`text-xl font-semibold tracking-tight font-mono ${
              resumo.saldoProjetado >= 0
                ? 'text-foreground'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {formatCurrency(resumo.saldoProjetado)}
          </div>
          <p className="text-[11px] text-muted-foreground">Considerando títulos a vencer</p>
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="p-3 rounded-lg border border-border bg-card shadow-subtle flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por descrição, NF, cliente ou fornecedor..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-muted-foreground/60 transition-colors"
          />
        </div>

        {/* Filter Badges / Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tipo Filter */}
          <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
            {['TODOS', 'RECEITA', 'DESPESA'].map((tipo) => (
              <button
                key={tipo}
                onClick={() => setFiltroTipo(tipo)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  filtroTipo === tipo
                    ? 'bg-background text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tipo === 'TODOS' ? 'Todos' : tipo === 'RECEITA' ? 'Receitas' : 'Despesas'}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="inline-flex rounded-md border border-border p-0.5 bg-muted/40">
            {['TODOS', 'PENDENTE', 'PAGO'].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded transition-colors ${
                  filtroStatus === status
                    ? 'bg-background text-foreground shadow-subtle'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'TODOS' ? 'Status: Todos' : status === 'PENDENTE' ? 'Pendentes' : 'Pagos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="rounded-lg border border-border bg-card shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground font-medium">
                <th className="py-2.5 px-4 w-12 text-center">Tipo</th>
                <th className="py-2.5 px-4">Descrição & Categoria</th>
                <th className="py-2.5 px-4">Documento / Vínculo</th>
                <th className="py-2.5 px-4">Vencimento</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4 text-right">Valor</th>
                <th className="py-2.5 px-4 text-center w-28">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {titulosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-xs font-medium">Nenhum lançamento financeiro encontrado.</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Cadastre receitas e despesas ou altere os filtros aplicados.
                    </p>
                  </td>
                </tr>
              ) : (
                titulosFiltrados.map((item) => {
                  const isReceita = item.tipo === 'RECEITA'
                  const isPago = item.status === 'PAGO'

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group text-foreground"
                    >
                      {/* Tipo Icon */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-semibold ${
                            isReceita
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}
                          title={isReceita ? 'Receita' : 'Despesa'}
                        >
                          {isReceita ? '+' : '-'}
                        </span>
                      </td>

                      {/* Descricao & Categoria */}
                      <td className="py-3 px-4">
                        <div className="font-medium text-foreground tracking-[-0.01em]">
                          {item.descricao}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-muted-foreground">
                          <span className="uppercase tracking-wider font-semibold">
                            {item.categoria}
                          </span>
                          {item.formaPagamento && (
                            <>
                              <span>•</span>
                              <span>{item.formaPagamento}</span>
                            </>
                          )}
                          {item.fornecedor && (
                            <>
                              <span>•</span>
                              <span>{item.fornecedor}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Documento / Vínculo */}
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.os ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-primary/10 text-primary border border-primary/20">
                            OS #{item.os.numero}
                          </span>
                        ) : item.documento ? (
                          <span className="font-mono text-[11px] text-foreground">
                            {item.documento}
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Vencimento */}
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        <div>{new Date(item.dataVencimento).toLocaleDateString('pt-BR')}</div>
                        {item.dataPagamento && (
                          <div className="text-[10px] text-emerald-600 dark:text-emerald-400">
                            Pago em {new Date(item.dataPagamento).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                            isPago
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : item.status === 'ATRASADO'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {isPago ? (
                            <Check className="w-2.5 h-2.5" />
                          ) : (
                            <Clock className="w-2.5 h-2.5" />
                          )}
                          {item.status}
                        </span>
                      </td>

                      {/* Valor */}
                      <td className="py-3 px-4 text-right font-mono font-medium text-xs">
                        <span
                          className={
                            isReceita
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-rose-600 dark:text-rose-400'
                          }
                        >
                          {isReceita ? '+' : '-'} {formatCurrency(item.valor)}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {!isPago && podeEditar && (
                            <button
                              onClick={() => handleBaixar(item.id)}
                              className="px-2 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 rounded border border-emerald-500/20 transition-colors"
                              title="Marcar como Liquidado / Pago"
                            >
                              Baixar
                            </button>
                          )}

                          {isAdmin && (
                            <button
                              onClick={() => handleExcluir(item.id)}
                              className="p-1 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
                              title="Excluir Lançamento (Registrado em Auditoria)"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Lançamento */}
      <AnimatePresence>
        {modalNovo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-card border border-border rounded-lg shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center">
                    <Receipt className="w-3.5 h-3.5" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">
                    Novo Lançamento Financeiro
                  </h2>
                </div>
                <button
                  onClick={() => setModalNovo(false)}
                  className="text-muted-foreground hover:text-foreground text-xs p-1 rounded"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleCriar} className="p-5 space-y-4">
                {erro && (
                  <div className="p-2.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
                    {erro}
                  </div>
                )}

                {/* Tipo Switcher */}
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground uppercase mb-1.5">
                    Natureza da Operação
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setFormTipo('RECEITA')
                        setFormCategoria('SERVICOS')
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md border transition-colors ${
                        formTipo === 'RECEITA'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      Receita (Entrada)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormTipo('DESPESA')
                        setFormCategoria('FORNECEDORES')
                      }}
                      className={`flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-md border transition-colors ${
                        formTipo === 'DESPESA'
                          ? 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold'
                          : 'border-border text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      Despesa (Saída)
                    </button>
                  </div>
                </div>

                {/* Descricao */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Descrição do Título *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Manutenção Preventiva - TechCorp / Aluguel da Oficina"
                    value={formDescricao}
                    onChange={(e) => setFormDescricao(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {/* Valor & Vencimento */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Valor (R$) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      value={formValor}
                      onChange={(e) =>
                        setFormValor(e.target.value === '' ? '' : Number(e.target.value))
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Data de Vencimento *
                    </label>
                    <input
                      type="date"
                      required
                      value={formDataVencimento}
                      onChange={(e) => setFormDataVencimento(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Categoria & Forma Pagamento */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Categoria Contábil
                    </label>
                    <select
                      value={formCategoria}
                      onChange={(e) => setFormCategoria(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {(formTipo === 'RECEITA' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA).map(
                        (cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formFormaPagamento}
                      onChange={(e) => setFormFormaPagamento(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {FORMAS_PAGAMENTO.map((fp) => (
                        <option key={fp.value} value={fp.value}>
                          {fp.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Documento / Fornecedor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Nº Documento / Nota Fiscal
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: NF-e 10492"
                      value={formDocumento}
                      onChange={(e) => setFormDocumento(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1">
                      Fornecedor / Favorecido
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Dell Brasil / Fornecedor XPTO"
                      value={formFornecedor}
                      onChange={(e) => setFormFornecedor(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                {/* Status Inicial */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Status do Lançamento
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormStatus('PENDENTE')}
                      className={`py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        formStatus === 'PENDENTE'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      Pendente (Previsão)
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormStatus('PAGO')}
                      className={`py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        formStatus === 'PAGO'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'border-border text-muted-foreground'
                      }`}
                    >
                      Liquidado (Já Pago/Recebido)
                    </button>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Observações Internas
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Informações adicionais para a conciliação..."
                    value={formObservacoes}
                    onChange={(e) => setFormObservacoes(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs rounded-md border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setModalNovo(false)}
                    className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground rounded-md border border-border transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3.5 py-1.5 text-xs font-medium text-white bg-primary rounded-md hover:bg-primary/90 transition-colors shadow-subtle disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Confirmar Lançamento'}
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
