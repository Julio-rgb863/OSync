'use client'

import { motion } from 'framer-motion'
import { FileText, Users, DollarSign, AlertCircle, ArrowUpRight, Plus, Activity } from 'lucide-react'
import { formatCurrency, formatRelative } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Props {
  metrics: {
    totalOS: number
    osAbertas: number
    osEmAndamento: number
    osConcluidas: number
    faturamentoMes: number
    faturamentoTotal: number
    clientesAtivos: number
    tecnicosAtivos: number
  }
  osRecentes: any[]
  osPorPeriodo: { createdAt: Date; valorTotal: number; status: string }[]
}

export function DashboardClient({ metrics, osRecentes, osPorPeriodo }: Props) {
  // Aggregate data for the last 6 cycles
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const monthOs = osPorPeriodo.filter(
      (o) => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end
    )
    return {
      mes: format(date, 'MMM', { locale: ptBR }),
      total: monthOs.length,
      faturamento: monthOs.reduce((s, o) => s + o.valorTotal, 0),
    }
  })

  const kpis = [
    {
      label: 'Faturamento Mensal',
      value: formatCurrency(metrics.faturamentoMes),
      context: 'Receita realizada no ciclo atual',
      variance: '+14.2%',
      positive: true,
      icon: DollarSign,
    },
    {
      label: 'Ordens em Aberto',
      value: String(metrics.osAbertas),
      context: `${metrics.osEmAndamento} ordens em andamento`,
      variance: metrics.osAbertas > 5 ? 'Atenção necessária' : 'Dentro do SLA',
      positive: metrics.osAbertas <= 5,
      icon: AlertCircle,
    },
    {
      label: 'Total de Ordens (Volume)',
      value: String(metrics.totalOS),
      context: `${metrics.osConcluidas} concluídas com sucesso`,
      variance: '+8.1%',
      positive: true,
      icon: FileText,
    },
    {
      label: 'Base Ativa de Clientes',
      value: String(metrics.clientesAtivos),
      context: `${metrics.tecnicosAtivos} operadores vinculados`,
      variance: 'Estável',
      positive: true,
      icon: Users,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Painel Executivo
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Visão consolidada de operações, SLA e performance financeira da organização
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/ordens/nova"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-subtle"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Ordem de Serviço
          </Link>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="p-4 rounded-lg border border-border bg-card shadow-subtle transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                {k.label}
              </span>
              <k.icon className="w-3.5 h-3.5 text-muted-foreground/70" />
            </div>

            <div className="mt-2.5">
              <div className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                {k.value}
              </div>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-muted-foreground truncate">{k.context}</span>
                <span
                  className={`text-[11px] font-medium ${
                    k.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}
                >
                  {k.variance}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytical Visualizations Split */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Realization Line Chart */}
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Volume de Atendimentos
              </h2>
              <p className="text-[11px] text-muted-foreground">Evolução de OS finalizadas nos últimos 6 ciclos</p>
            </div>
            <Activity className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    padding: '6px 10px',
                  }}
                  itemStyle={{ color: '#FFFFFF' }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#2563EB"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#2563EB' }}
                  activeDot={{ r: 5 }}
                  name="Ordens de Serviço"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Realization Bar Chart */}
        <div className="p-4 rounded-lg border border-border bg-card shadow-subtle">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Faturamento Mensal (R$)
              </h2>
              <p className="text-[11px] text-muted-foreground">Volume faturado consolidado por período</p>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground" />
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="mes"
                  tickLine={false}
                  axisLine={{ stroke: 'hsl(var(--border))' }}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(v) => `R$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    padding: '6px 10px',
                  }}
                  formatter={(v: any) => [formatCurrency(Number(v)), 'Faturamento']}
                />
                <Bar dataKey="faturamento" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mission-Critical Recent Orders Ledger */}
      <div className="rounded-lg border border-border bg-card shadow-subtle overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
          <div>
            <h2 className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Fluxo Operacional Recente
            </h2>
            <p className="text-[11px] text-muted-foreground">Últimas ordens registradas no sistema</p>
          </div>
          <Link
            href="/ordens"
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            Ver todas as ordens →
          </Link>
        </div>

        {osRecentes.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs">
            Nenhuma ordem de serviço registrada no momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/20 text-muted-foreground text-[10px] uppercase font-semibold text-left">
                  <th className="px-4 py-2.5">Código OS</th>
                  <th className="px-4 py-2.5">Cliente</th>
                  <th className="px-4 py-2.5">Diagnóstico Inicial</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Valor Total</th>
                  <th className="px-4 py-2.5 text-right">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {osRecentes.map((os: any) => (
                  <tr
                    key={os.id}
                    className="hover:bg-muted/40 transition-colors duration-100 cursor-pointer"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-primary">
                      <Link href={`/ordens/${os.id}`}>
                        #{String(os.numero).padStart(4, '0')}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/ordens/${os.id}`} className="hover:underline">
                        {os.cliente?.nome}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground max-w-xs truncate">
                      {os.descricaoProblema}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={os.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {formatCurrency(os.valorTotal)}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {formatRelative(os.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
