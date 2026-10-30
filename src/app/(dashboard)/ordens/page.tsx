import { prisma } from '@/lib/prisma'
import { OrdensClient } from '@/components/ordens/ordens-client'

export default async function OrdensPage() {
  const ordens = await prisma.ordemDeServico.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      cliente: { select: { nome: true } },
      equipamento: { select: { tipo: true, marca: true, modelo: true } },
      tecnico: { select: { name: true } },
    },
  })
  return <OrdensClient ordens={ordens as any} />
}
