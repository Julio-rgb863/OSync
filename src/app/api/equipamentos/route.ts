import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const clienteId = searchParams.get('clienteId')
  const equipamentos = await prisma.equipamento.findMany({
    where: clienteId ? { clienteId } : undefined,
    include: { cliente: { select: { nome: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(equipamentos)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const eq = await prisma.equipamento.create({
    data: {
      clienteId: body.clienteId,
      tipo: body.tipo || 'OUTRO',
      marca: body.marca || null,
      modelo: body.modelo || null,
      numeroSerie: body.numeroSerie || null,
      descricao: body.descricao || null,
      senha: body.senha || null,
      acessorios: body.acessorios || null,
    },
  })
  return NextResponse.json(eq, { status: 201 })
}
