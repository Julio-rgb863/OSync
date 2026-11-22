import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type Params = { params: Promise<{ id: string }> }

// GET /api/fornecedores/[id]
export async function GET(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { id } = await params
  const fornecedor = await prisma.fornecedor.findUnique({
    where: { id },
    include: {
      pedidos: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!fornecedor) return NextResponse.json({ error: 'Fornecedor não encontrado' }, { status: 404 })
  return NextResponse.json(fornecedor)
}

// PATCH /api/fornecedores/[id]
export async function PATCH(req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'ADMIN' && role !== 'TECNICO') {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const userId = (session.user as any).id

  const anterior = await prisma.fornecedor.findUnique({ where: { id } })
  if (!anterior) return NextResponse.json({ error: 'Não encontrado' }, { status: 404 })

  const data: any = { ...body }
  if (body.prazoEntregaDias !== undefined) data.prazoEntregaDias = Number(body.prazoEntregaDias)
  if (body.avaliacao !== undefined) data.avaliacao = Number(body.avaliacao)

  const atualizado = await prisma.fornecedor.update({
    where: { id },
    data,
  })

  // Trilha de Auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'Fornecedor',
      entityId: id,
      action: 'UPDATE',
      diffBefore: JSON.stringify({ razaoSocial: anterior.razaoSocial, avaliacao: anterior.avaliacao }),
      diffAfter: JSON.stringify({ razaoSocial: atualizado.razaoSocial, avaliacao: atualizado.avaliacao }),
    },
  })

  return NextResponse.json(atualizado)
}

// DELETE /api/fornecedores/[id]
export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'ADMIN') {
    return NextResponse.json({ error: 'Apenas administradores podem desativar fornecedores' }, { status: 403 })
  }

  const { id } = await params
  const userId = (session.user as any).id

  const fornecedor = await prisma.fornecedor.update({
    where: { id },
    data: { ativo: false },
  })

  // Trilha de Auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'Fornecedor',
      entityId: id,
      action: 'DELETE',
      diffBefore: JSON.stringify({ ativo: true }),
      diffAfter: JSON.stringify({ ativo: false }),
    },
  })

  return NextResponse.json({ ok: true })
}
