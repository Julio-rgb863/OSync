import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { MondayClient } from '@/lib/integrations/monday'

// POST /api/integrations/monday — Testa conexão e lista quadros
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { token } = await req.json()
    const client = new MondayClient(token)

    const [user, boards] = await Promise.all([
      client.testConnection(),
      client.getBoards(10),
    ])

    return NextResponse.json({
      ok: true,
      user,
      boards,
    })
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error.message || 'Falha ao autenticar com monday.com' },
      { status: 400 }
    )
  }
}
