import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({
    where: { id },
    include: {
      equipamentos: true,
      ordens: { orderBy: { createdAt: 'desc' }, include: { tecnico: { select: { name: true } } } },
    },
  })
  if (!cliente) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cliente)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      nome: body.nome,
      email: body.email || null,
      telefone: body.telefone || null,
      cpfCnpj: body.cpfCnpj || null,
      endereco: body.endereco || null,
      cidade: body.cidade || null,
      estado: body.estado || null,
      cep: body.cep || null,
      observacoes: body.observacoes || null,
    },
  })
  return NextResponse.json(cliente)
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if ((session.user as any).role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  await prisma.cliente.update({ where: { id }, data: { ativo: false } })
  return NextResponse.json({ success: true })
}
