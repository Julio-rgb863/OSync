import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/pecas
export async function GET(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? ''
  const apenasAtivos = searchParams.get('ativos') !== 'false'

  const pecas = await prisma.peca.findMany({
    where: {
      ativo: apenasAtivos ? true : undefined,
      OR: q
        ? [
            { nome: { contains: q } },
            { codigo: { contains: q } },
            { fornecedor: { contains: q } },
          ]
        : undefined,
    },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json(pecas)
}

// POST /api/pecas
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const role = (session.user as any).role as string
  if (!['ADMIN', 'TECNICO'].includes(role)) {
    return NextResponse.json({ error: 'Sem permissão' }, { status: 403 })
  }

  const body = await req.json()
  const peca = await prisma.peca.create({ data: body })
  return NextResponse.json(peca, { status: 201 })
}
