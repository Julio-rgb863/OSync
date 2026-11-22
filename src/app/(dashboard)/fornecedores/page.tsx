import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FornecedoresClient, FornecedorItem } from '@/components/fornecedores/fornecedores-client'

export default async function FornecedoresPage() {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  const isAdmin = role === 'ADMIN'
  const podeEditar = role === 'ADMIN' || role === 'TECNICO'

  const fornecedoresDb = await prisma.fornecedor.findMany({
    where: { ativo: true },
    orderBy: { razaoSocial: 'asc' },
    include: {
      _count: { select: { pedidos: true } },
    },
  })

  const fornecedores: FornecedorItem[] = fornecedoresDb.map((f) => ({
    id: f.id,
    razaoSocial: f.razaoSocial,
    nomeFantasia: f.nomeFantasia,
    cnpj: f.cnpj,
    email: f.email,
    telefone: f.telefone,
    categoria: f.categoria,
    prazoEntregaDias: f.prazoEntregaDias,
    avaliacao: f.avaliacao,
    condicaoPagamento: f.condicaoPagamento,
    endereco: f.endereco,
    cidade: f.cidade,
    estado: f.estado,
    ativo: f.ativo,
    observacoes: f.observacoes,
    _count: f._count,
  }))

  return (
    <FornecedoresClient
      fornecedoresIniciais={fornecedores}
      podeEditar={podeEditar}
      isAdmin={isAdmin}
    />
  )
}
