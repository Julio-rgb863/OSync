import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { FinanceiroClient, TituloItem, ResumoFinanceiro } from '@/components/financeiro/financeiro-client'

export default async function FinanceiroPage() {
  const session = await auth()
  const role = (session?.user as any)?.role as string | undefined
  const isAdmin = role === 'ADMIN'
  const podeEditar = role === 'ADMIN' || role === 'TECNICO'

  const [titulosDb, todosDb] = await Promise.all([
    prisma.tituloFinanceiro.findMany({
      orderBy: { dataVencimento: 'asc' },
      include: {
        os: { select: { numero: true } },
      },
    }),
    prisma.tituloFinanceiro.findMany(),
  ])

  // Consolidação Financeira Executiva
  const totalReceitas = todosDb
    .filter((t) => t.tipo === 'RECEITA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor, 0)

  const aReceber = todosDb
    .filter((t) => t.tipo === 'RECEITA' && t.status === 'PENDENTE')
    .reduce((acc, t) => acc + t.valor, 0)

  const totalDespesas = todosDb
    .filter((t) => t.tipo === 'DESPESA' && t.status === 'PAGO')
    .reduce((acc, t) => acc + t.valor, 0)

  const aPagar = todosDb
    .filter((t) => t.tipo === 'DESPESA' && t.status === 'PENDENTE')
    .reduce((acc, t) => acc + t.valor, 0)

  const saldoRealizado = totalReceitas - totalDespesas
  const saldoProjetado = saldoRealizado + (aReceber - aPagar)

  const resumo: ResumoFinanceiro = {
    totalReceitas,
    aReceber,
    totalDespesas,
    aPagar,
    saldoRealizado,
    saldoProjetado,
  }

  const titulos: TituloItem[] = titulosDb.map((t) => ({
    id: t.id,
    tipo: t.tipo,
    categoria: t.categoria,
    descricao: t.descricao,
    valor: t.valor,
    dataVencimento: t.dataVencimento.toISOString(),
    dataPagamento: t.dataPagamento ? t.dataPagamento.toISOString() : null,
    status: t.status,
    formaPagamento: t.formaPagamento,
    documento: t.documento,
    osId: t.osId,
    clienteId: t.clienteId,
    fornecedor: t.fornecedor,
    observacoes: t.observacoes,
    os: t.os ? { numero: t.os.numero } : null,
  }))

  return (
    <FinanceiroClient
      titulosIniciais={titulos}
      resumoInicial={resumo}
      podeEditar={podeEditar}
      isAdmin={isAdmin}
    />
  )
}
