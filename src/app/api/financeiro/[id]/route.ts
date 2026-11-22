import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/financeiro/[id] — Baixa ou atualização de título
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const userId = (session.user as any).id

  const anterior = await prisma.tituloFinanceiro.findUnique({ where: { id } })
  if (!anterior) return NextResponse.json({ error: 'Título não encontrado' }, { status: 404 })

  const data: any = { ...body }
  if (body.valor !== undefined) data.valor = Number(body.valor)
  if (body.dataVencimento !== undefined) data.dataVencimento = new Date(body.dataVencimento)
  if (body.status === 'PAGO' && !anterior.dataPagamento) {
    data.dataPagamento = new Date()
  }

  const atualizado = await prisma.tituloFinanceiro.update({
    where: { id },
    data,
  })

  // Trilha de Auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'TituloFinanceiro',
      entityId: id,
      action: body.status === 'PAGO' ? 'APPROVE' : 'UPDATE',
      diffBefore: JSON.stringify({ status: anterior.status, valor: anterior.valor }),
      diffAfter: JSON.stringify({ status: atualizado.status, valor: atualizado.valor }),
    },
  })

  return NextResponse.json(atualizado)
}

// DELETE /api/financeiro/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem excluir títulos' }, { status: 403 })
  }

  const { id } = await params
  const userId = (session.user as any).id

  const titulo = await prisma.tituloFinanceiro.findUnique({ where: { id } })
  if (!titulo) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  await prisma.tituloFinanceiro.delete({ where: { id } })

  // Trilha de Auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'TituloFinanceiro',
      entityId: id,
      action: 'DELETE',
      diffBefore: JSON.stringify({ descricao: titulo.descricao, valor: titulo.valor }),
    },
  })

  return NextResponse.json({ ok: true })
}
