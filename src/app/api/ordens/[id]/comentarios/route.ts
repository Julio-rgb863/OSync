import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params
  const body = await req.json()
  const c = await prisma.comentarioOS.create({
    data: { osId: id, userId: (session.user as any).id, texto: body.texto, interno: body.interno || false },
  })
  return NextResponse.json(c, { status: 201 })
}
