import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/financeiro — Lista lançamentos e consolidação do DRE/Fluxo de caixa
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const tipo = searchParams.get('tipo') // RECEITA | DESPESA
  const status = searchParams.get('status') // PENDENTE | PAGO | CANCELADO | ATRASADO

  const where: any = {}
  if (tipo) where.tipo = tipo
  if (status) where.status = status

  const [titulos, todos] = await Promise.all([
    prisma.tituloFinanceiro.findMany({
      where,
      orderBy: { dataVencimento: 'asc' },
      include: { os: { select: { numero: true } } },
    }),
    prisma.tituloFinanceiro.findMany(),
  ])

  // Consolidação de Indicadores
  const totalReceitas = todos
    .filter((t) => t.tipo === 'RECEITA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor, 0)

  const aReceber = todos
    .filter((t) => t.tipo === 'RECEITA' && t.status === 'PENDENTE')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalDespesas = todos
    .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor, 0)

  const aPagar = todos
    .filter((t) => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
    .reduce((acc, t) => acc + t.valor, 0)

  const saldoRealizado = totalReceitas - totalDespesas
  const saldoProjetado = saldoRealizado + (aReceber - aPagar)

  return NextResponse.json({
    titulos,
    resumo: {
      totalReceitas,
      aReceber,
      totalDespesas,
      aPagar,
      saldoRealizado,
      saldoProjetado,
    },
  })
}

// POST /api/financeiro — Novo lançamento (Receita ou Despesa)
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const userId = (session.user as any).id

  const titulo = await prisma.tituloFinanceiro.create({
    data: {
      tipo: body.tipo, // RECEITA | DESPESA
      categoria: body.categoria || 'OUTROS',
      descricao: body.descricao,
      valor: Number(body.valor),
      dataVencimento: new Date(body.dataVencimento),
      dataPagamento: body.status === 'PAGO' ? new Date() : null,
      status: body.status || 'PENDENTE',
      formaPagamento: body.formaPagamento || 'PIX',
      documento: body.documento || null,
      osId: body.osId || null,
      clienteId: body.clienteId || null,
      fornecedor: body.fornecedor || null,
      observacoes: body.observacoes || null,
      usuarioId: userId || null,
    },
  })

  // Trilha de Auditoria
  await prisma.auditLog.create({
    data: {
      userId,
      entity: 'TituloFinanceiro',
      entityId: titulo.id,
      action: 'CREATE',
      diffAfter: JSON.stringify({
        tipo: titulo.tipo,
        valor: titulo.valor,
        descricao: titulo.descricao,
      }),
    },
  })

  return NextResponse.json(titulo, { status: 201 })
}
