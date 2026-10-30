import { prisma } from '@/lib/prisma'
import { ClientesClient } from '@/components/clientes/clientes-client'

export default async function ClientesPage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ordens: true, equipamentos: true } } },
  })
  return <ClientesClient clientes={clientes as any} />
}
