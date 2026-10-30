import { prisma } from '@/lib/prisma'
import { NovaOSClient } from '@/components/ordens/nova-os-client'

export default async function NovaOSPage() {
  const [clientes, tecnicos] = await Promise.all([
    prisma.cliente.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } }),
    prisma.user.findMany({ where: { role: 'TECNICO', ativo: true }, select: { id: true, name: true } }),
  ])
  return <NovaOSClient clientes={clientes} tecnicos={tecnicos} />
}
