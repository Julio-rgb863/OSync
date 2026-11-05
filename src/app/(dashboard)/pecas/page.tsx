import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { PecasClient } from '@/components/pecas/pecas-client'

export default async function PecasPage() {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  const podeEditar = role === 'ADMIN' || role === 'TECNICO'

  const pecas = await prisma.peca.findMany({
    where: { ativo: true },
    orderBy: { nome: 'asc' },
  })

  return (
    <PecasClient
      pecas={pecas.map((p) => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() }))}
      podeEditar={podeEditar}
    />
  )
}
