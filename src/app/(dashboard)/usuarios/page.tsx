import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { UsuariosClient } from '@/components/usuarios/usuarios-client'

export default async function UsuariosPage() {
  const session = await auth()
  if ((session?.user as any)?.role !== 'ADMIN') redirect('/dashboard')

  const usuarios = await prisma.user.findMany({
    where: { ativo: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      ativo: true,
      createdAt: true,
      _count: { select: { ordens: true } },
    },
    orderBy: { name: 'asc' },
  })

  return (
    <UsuariosClient
      usuarios={usuarios.map((u) => ({ ...u, createdAt: u.createdAt.toISOString() }))}
    />
  )
}
