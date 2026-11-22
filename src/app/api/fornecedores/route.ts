import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/fornecedores — Lista fornecedores com filtro e estatísticas
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const categoria = searchParams.get('categoria')

  const where: any = { ativo: true }
  if (categoria && categoria !== 'TODAS') {
    where.categoria = categoria
  }
  if (q) {
    where.OR = [
      { razaoSocial: { contains: q } },
      { nomeFantasia: { contains: q } },
      { cnpj: { contains: q } },
      { email: { contains: q } },
    ]
  }

  const fornecedores = await prisma.fornecedor.findMany({
    where,
    orderBy: { razaoSocial: 'asc' },
    include: {
      _count: { select: { pedidos: true } },
    },
  })

  return NextResponse.json(fornecedores)
}

// POST /api/fornecedores — Cadastra novo fornecedor corporativo
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role
  if (role !== 'ADMIN' && role !== 'TECNICO') {
    return NextResponse.json({ error: 'Sem permissão para cadastrar fornecedores' }, { status: 403 })
  }

  const body = await req.json()
  const userId = (session.user as any).id

  if (!body.razaoSocial?.trim()) {
    return NextResponse.json({ error: 'Razão Social é obrigatória' }, { status: 400 })
  }

  const fornecedor = await prisma.fornecedor.create({
    data: {
      razaoSocial: body.razaoSocial.trim(),
      nomeFantasia: body.nomeFantasia?.trim() || null,
      cnpj: body.cnpj?.trim() || null,
      email: body.email?.trim() || null,
      telefone: body.telefone?.trim() || null,
      categoria: body.categoria || 'PECAS',
      prazoEntregaDias: Number(body.prazoEntregaDias) || 3,
      avaliacao: Number(body.avaliacao) || 5.0,
      condicaoPagamento: body.condicaoPagamento?.trim() || null,
      endereco: body.endereco?.trim() || null,
      cidade: body.cidade?.trim() || null,
      estado: body.estado?.trim() || null,
      observacoes: body.observacoes?.trim() || null,
    },
  })

  // Trilha de Auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'Fornecedor',
      entityId: fornecedor.id,
      action: 'CREATE',
      diffAfter: JSON.stringify({
        razaoSocial: fornecedor.razaoSocial,
        cnpj: fornecedor.cnpj,
        categoria: fornecedor.categoria,
      }),
    },
  })

  return NextResponse.json(fornecedor, { status: 201 })
}
