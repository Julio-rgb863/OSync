import { prisma } from '@/lib/prisma'
import { DashboardClient } from '@/components/dashboard/dashboard-client'
import { subMonths, startOfMonth, endOfMonth } from 'date-fns'

export default async function DashboardPage() {
  const [totalOS, osAbertas, osEmAndamento, osConcluidas, clientesAtivos, tecnicosAtivos] =
    await Promise.all([
      prisma.ordemDeServico.count(),
      prisma.ordemDeServico.count({ where: { status: 'ABERTA' } }),
      prisma.ordemDeServico.count({ where: { status: 'EM_ANDAMENTO' } }),
      prisma.ordemDeServico.count({ where: { status: 'CONCLUIDA' } }),
      prisma.cliente.count({ where: { ativo: true } }),
      prisma.user.count({ where: { role: 'TECNICO', ativo: true } }),
    ])

  const inicioMes = startOfMonth(new Date())

  const [fatMes, fatTotal] = await Promise.all([
    prisma.ordemDeServico.aggregate({
      _sum: { valorTotal: true },
      where: { status: { in: ['CONCLUIDA', 'ENTREGUE'] }, dataConclusao: { gte: inicioMes } },
    }),
    prisma.ordemDeServico.aggregate({
      _sum: { valorTotal: true },
      where: { status: { in: ['CONCLUIDA', 'ENTREGUE'] } },
    }),
  ])

  const osRecentes = await prisma.ordemDeServico.findMany({
    take: 8,
    orderBy: { createdAt: 'desc' },
    include: {
      cliente: { select: { nome: true } },
      tecnico: { select: { name: true } },
    },
  })

  // últimos 6 meses para o gráfico
  const seisAtras = subMonths(new Date(), 5)
  const osPorPeriodo = await prisma.ordemDeServico.findMany({
    where: { createdAt: { gte: startOfMonth(seisAtras) } },
    select: { createdAt: true, valorTotal: true, status: true },
  })

  return (
    <DashboardClient
      metrics={{
        totalOS,
        osAbertas,
        osEmAndamento,
        osConcluidas,
        faturamentoMes: fatMes._sum.valorTotal ?? 0,
        faturamentoTotal: fatTotal._sum.valorTotal ?? 0,
        clientesAtivos,
        tecnicosAtivos,
      }}
      osRecentes={osRecentes as any}
      osPorPeriodo={osPorPeriodo}
    />
  )
}
