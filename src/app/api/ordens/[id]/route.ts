import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { syncOrdemServicoToMonday } from '@/lib/integrations/monday'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const ordem = await prisma.ordemDeServico.findUnique({
    where: { id },
    include: {
      cliente: true, equipamento: true, tecnico: true,
      historicos: { orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true } } } },
      pecas: { include: { peca: true } },
      anexos: true,
      comentarios: { orderBy: { createdAt: 'asc' }, include: { user: { select: { name: true } } } },
    },
  })
  if (!ordem) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ordem)
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const current = await prisma.ordemDeServico.findUnique({ where: { id }, select: { status: true } })

  const data: any = {}
  if (body.status !== undefined) data.status = body.status
  if (body.laudoTecnico !== undefined) data.laudoTecnico = body.laudoTecnico
  if (body.observacoesInternas !== undefined) data.observacoesInternas = body.observacoesInternas
  if (body.valorServico !== undefined) data.valorServico = body.valorServico
  if (body.valorPecas !== undefined) data.valorPecas = body.valorPecas
  if (body.valorTotal !== undefined) data.valorTotal = body.valorTotal
  if (body.tecnicoId !== undefined) data.tecnicoId = body.tecnicoId
  if (body.aprovadoPeloCliente !== undefined) data.aprovadoPeloCliente = body.aprovadoPeloCliente
  if (body.status === 'CONCLUIDA') data.dataConclusao = new Date()
  if (body.status === 'ENTREGUE') data.dataEntrega = new Date()

  const ordem = await prisma.ordemDeServico.update({ where: { id }, data })

  if (body.status && body.status !== current?.status) {
    await prisma.historicoOS.create({
      data: {
        osId: id,
        userId: (session.user as any).id,
        statusAnterior: current?.status,
        statusNovo: body.status,
        observacao: body.observacao || `Status alterado para ${body.status}`,
      },
    })
  }

  // Sincroniza atualização com o monday.com
  syncOrdemServicoToMonday(id).catch((e) =>
    console.error('Falha ao sincronizar atualização com monday.com:', e)
  )

  return NextResponse.json(ordem)
}
