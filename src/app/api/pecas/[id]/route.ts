import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET /api/pecas/[id]
export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  const { id } = await params
  const peca = await prisma.peca.findUnique({ where: { id } })
  if (!peca) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })
  return NextResponse.json(peca)
}

// PUT /api/pecas/[id]
export async function PUT(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  if (!['ADMIN', 'TECNICO'].includes(role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const peca = await prisma.peca.update({ where: { id }, data: body })
  return NextResponse.json(peca)
}

// DELETE /api/pecas/[id] — soft delete
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  await prisma.peca.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json({ ok: true })
}
