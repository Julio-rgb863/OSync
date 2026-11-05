import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

type Params = { params: Promise<{ id: string }> }

// PUT /api/usuarios/[id]
export async function PUT(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  const myId = (session.user as any).id as string
  const { id } = await params

  // Usuário comum pode editar só o próprio perfil (name/email, sem mudar role)
  if (role !== 'ADMIN' && id !== myId) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { name, email, role: newRole, password } = await req.json()

  const data: Record<string, unknown> = { name, email }
  if (role === 'ADMIN') data.role = newRole  // só admin pode trocar role
  if (password) data.password = await bcrypt.hash(password, 12)

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, name: true, email: true, role: true },
  })

  return NextResponse.json(user)
}

// DELETE /api/usuarios/[id] — soft delete
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const myId = (session.user as any).id as string
  if (id === myId) return NextResponse.json({ error: 'Não pode desativar a si mesmo' }, { status: 400 })

  await prisma.user.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json({ ok: true })
}
