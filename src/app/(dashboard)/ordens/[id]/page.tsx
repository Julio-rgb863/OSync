import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import { OSDetailClient } from '@/components/ordens/os-detail-client'

export default async function OSPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [session, ordem] = await Promise.all([
    auth(),
    prisma.ordemDeServico.findUnique({
      where: { id },
      include: {
        cliente: true,
        equipamento: true,
        tecnico: true,
        historicos: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { name: true, role: true } } },
        },
        pecas: { include: { peca: true } },
        anexos: true,
        comentarios: {
          orderBy: { createdAt: 'asc' },
          include: { user: { select: { name: true, role: true } } },
        },
      },
    }),
  ])

  if (!ordem) notFound()

  return (
    <OSDetailClient
      ordem={ordem as any}
      userRole={(session?.user as any)?.role || 'ATENDENTE'}
      userId={(session?.user as any)?.id || ''}
    />
  )
}
