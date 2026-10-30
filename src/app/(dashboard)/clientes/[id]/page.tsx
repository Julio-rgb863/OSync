import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ClienteDetalheClient } from '@/components/clientes/cliente-detalhe-client'

export default async function ClienteDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      equipamentos: true,
      ordens: {
        orderBy: { createdAt: 'desc' },
        include: { tecnico: { select: { name: true } } },
      },
    },
  })
  if (!cliente) notFound()
  return <ClienteDetalheClient cliente={cliente as any} />
}
