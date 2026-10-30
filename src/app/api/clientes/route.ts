import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { ordens: true, equipamentos: true } } },
  })
  return NextResponse.json(clientes)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const cliente = await prisma.cliente.create({
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
  return NextResponse.json(cliente, { status: 201 })
}
