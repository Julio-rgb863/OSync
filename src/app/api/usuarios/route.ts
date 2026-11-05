import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/usuarios
export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const usuarios = await prisma.user.findMany({
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

  return NextResponse.json(usuarios)
}

// POST /api/usuarios
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { name, email, password, role: newRole } = await req.json()

  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: newRole ?? 'ATENDENTE' },
    select: { id: true, name: true, email: true, role: true, ativo: true, createdAt: true },
  })

  return NextResponse.json(user, { status: 201 })
}
