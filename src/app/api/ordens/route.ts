import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const ordens = await prisma.ordemDeServico.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      cliente: { select: { nome: true } },
      equipamento: { select: { tipo: true, marca: true, modelo: true } },
      tecnico: { select: { name: true } },
    },
  })
  return NextResponse.json(ordens)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()

  const lastOS = await prisma.ordemDeServico.findFirst({
    orderBy: { numero: 'desc' },
    select: { numero: true },
  })
  const nextNumero = (lastOS?.numero || 0) + 1

  const ordem = await prisma.ordemDeServico.create({
    data: {
      numero: nextNumero,
      clienteId: body.clienteId,
      equipamentoId: body.equipamentoId || null,
      tecnicoId: body.tecnicoId || null,
      prioridade: body.prioridade || 'MEDIA',
      descricaoProblema: body.descricaoProblema,
      dataPrazo: body.dataPrazo ? new Date(body.dataPrazo) : null,
    },
  })

  // histórico inicial
  await prisma.historicoOS.create({
    data: {
      osId: ordem.id,
      userId: (session.user as any).id,
      statusNovo: 'ABERTA',
      observacao: 'Ordem de serviço criada',
    },
  })
  return NextResponse.json(ordem, { status: 201 })
}
