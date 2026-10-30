'use client'

import { motion } from 'framer-motion'
import { FileText, Users, DollarSign, AlertCircle, TrendingUp, Wrench } from 'lucide-react'
import { formatCurrency, formatRelative, STATUS_OS } from '@/lib/utils'
import { StatusBadge } from '@/components/shared/status-badge'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

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
  // Gerar dados dos últimos 6 meses
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(new Date(), 5 - i)
    const start = startOfMonth(date)
    const end = endOfMonth(date)
    const monthOs = osPorPeriodo.filter(o => new Date(o.createdAt) >= start && new Date(o.createdAt) <= end)
    return {
      mes: format(date, 'MMM', { locale: ptBR }),
      total: monthOs.length,
      faturamento: monthOs.reduce((s, o) => s + o.valorTotal, 0),
    }
  })

  const pieData = [
    { name: 'Abertas', value: metrics.osAbertas, color: '#3B82F6' },
    { name: 'Em Andamento', value: metrics.osEmAndamento, color: '#6366F1' },
    { name: 'Concluídas', value: metrics.osConcluidas, color: '#10B981' },
  ]

  const kpis = [
    {
      label: 'Total de OS', value: String(metrics.totalOS),
      icon: FileText, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20',
      sub: `${metrics.osEmAndamento} em andamento`,
    },
    {
      label: 'OS Abertas', value: String(metrics.osAbertas),
      icon: AlertCircle, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20',
      sub: 'Aguardando atendimento',
    },
    {
      label: 'Clientes', value: String(metrics.clientesAtivos),
      icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20',
      sub: 'Cadastros ativos',
    },
    {
      label: 'Faturamento / Mês', value: formatCurrency(metrics.faturamentoMes),
      icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20',
      sub: `Total: ${formatCurrency(metrics.faturamentoTotal)}`,
    },
  ]

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Visão geral do sistema</p>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <motion.div
            key={k.label}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={`p-5 rounded-xl border ${k.border} ${k.bg} flex items-start gap-4`}
          >
            <div className={`p-2.5 rounded-lg ${k.bg} border ${k.border}`}>
              <k.icon className={`w-5 h-5 ${k.color}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{k.label}</p>
              <p className="text-2xl font-bold mt-0.5">{k.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Line chart */}
        <motion.div variants={item} className="xl:col-span-2 p-6 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold mb-4">OS por Mês</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="total" stroke="#6366F1" strokeWidth={2}
                dot={{ fill: '#6366F1', r: 4 }} activeDot={{ r: 6 }} name="OS" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie chart */}
        <motion.div variants={item} className="p-6 rounded-xl border border-border bg-card">
          <h3 className="text-sm font-semibold mb-4">OS por Status</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {pieData.map(p => (
              <div key={p.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
                  <span className="text-muted-foreground">{p.name}</span>
                </div>
                <span className="font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Faturamento bar */}
      <motion.div variants={item} className="p-6 rounded-xl border border-border bg-card">
        <h3 className="text-sm font-semibold mb-4">Faturamento por Mês (R\$)</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `R$${v}`} />
            <Tooltip
              contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
              formatter={(v: any) => [formatCurrency(v), 'Faturamento']}
            />
            <Bar dataKey="faturamento" fill="#6366F1" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* OS Recentes */}
      <motion.div variants={item} className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h3 className="font-semibold">Ordens Recentes</h3>
          <Link href="/ordens" className="text-sm text-primary hover:underline">Ver todas →</Link>
        </div>
        {osRecentes.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p>Nenhuma OS cadastrada ainda</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {osRecentes.map((os: any) => (
              <Link key={os.id} href={`/ordens/${os.id}`}>
                <motion.div
                  whileHover={{ backgroundColor: 'rgba(99,102,241,0.04)' }}
                  className="flex items-center justify-between px-5 py-3.5 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-sm text-primary font-semibold">
                      #{String(os.numero).padStart(4, '0')}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{os.cliente?.nome}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-xs">
                        {os.descricaoProblema?.slice(0, 60)}{os.descricaoProblema?.length > 60 ? '...' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={os.status} />
                    <span className="text-xs text-muted-foreground hidden md:block">
                      {formatRelative(os.createdAt)}
                    </span>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
