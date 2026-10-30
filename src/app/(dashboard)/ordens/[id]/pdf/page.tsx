import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default async function OSPdfPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ordem = await prisma.ordemDeServico.findUnique({
    where: { id },
    include: { cliente: true, equipamento: true, tecnico: true, pecas: { include: { peca: true } } },
  })
  if (!ordem) notFound()

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
  const fmtDate = (d: Date | null) => d ? format(new Date(d), 'dd/MM/yyyy', { locale: ptBR }) : '—'

  const statusLabels: Record<string, string> = {
    ABERTA: 'Aberta', EM_ANDAMENTO: 'Em Andamento', AGUARDANDO_PECA: 'Aguardando Peça',
    CONCLUIDA: 'Concluída', ENTREGUE: 'Entregue', CANCELADA: 'Cancelada',
  }

  return (
    <div className="max-w-3xl mx-auto p-8 bg-white text-gray-900 min-h-screen print:p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-200">
        <div>
          <h1 className="text-3xl font-black text-indigo-600">OSync</h1>
          <p className="text-gray-500 text-sm">Sistema de Ordem de Serviço</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold">OS #{String(ordem.numero).padStart(4, '0')}</p>
          <p className="text-sm text-gray-500">{fmtDate(ordem.createdAt)}</p>
          <span className="inline-block mt-1 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
            {statusLabels[ordem.status] || ordem.status}
          </span>
        </div>
      </div>

      {/* Cliente + Equipamento */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Cliente</h3>
          <p className="font-semibold text-lg">{ordem.cliente?.nome}</p>
          {ordem.cliente?.email && <p className="text-sm text-gray-600">{ordem.cliente.email}</p>}
          {ordem.cliente?.telefone && <p className="text-sm text-gray-600">{ordem.cliente.telefone}</p>}
          {ordem.cliente?.cpfCnpj && <p className="text-sm text-gray-500">CPF/CNPJ: {ordem.cliente.cpfCnpj}</p>}
        </div>
        {ordem.equipamento && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Equipamento</h3>
            <p className="font-semibold">{ordem.equipamento.marca} {ordem.equipamento.modelo}</p>
            <p className="text-sm text-gray-600">{ordem.equipamento.tipo}</p>
            {ordem.equipamento.numeroSerie && <p className="text-sm text-gray-500">S/N: {ordem.equipamento.numeroSerie}</p>}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg text-sm">
        <div><p className="text-gray-400 text-xs">Técnico</p><p className="font-medium">{ordem.tecnico?.name || '—'}</p></div>
        <div><p className="text-gray-400 text-xs">Prioridade</p><p className="font-medium">{ordem.prioridade}</p></div>
        <div><p className="text-gray-400 text-xs">Prazo</p><p className="font-medium">{fmtDate(ordem.dataPrazo)}</p></div>
      </div>

      {/* Problema */}
      <div className="mb-6">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Descrição do Problema</h3>
        <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">{ordem.descricaoProblema}</div>
      </div>

      {ordem.laudoTecnico && (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Laudo Técnico</h3>
          <div className="p-4 bg-gray-50 rounded-lg text-sm whitespace-pre-wrap">{ordem.laudoTecnico}</div>
        </div>
      )}

      {/* Peças */}
      {ordem.pecas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Peças Utilizadas</h3>
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden text-sm">
            <thead className="bg-gray-50">
              <tr>{['Peça', 'Qtd', 'Unit.', 'Total'].map(h => <th key={h} className="px-4 py-2 text-left text-xs text-gray-500 font-medium">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {ordem.pecas.map((p: any) => (
                <tr key={p.id}>
                  <td className="px-4 py-2">{p.peca.nome}</td>
                  <td className="px-4 py-2">{p.quantidade}</td>
                  <td className="px-4 py-2">{fmt(p.precoUnitario)}</td>
                  <td className="px-4 py-2 font-medium">{fmt(p.quantidade * p.precoUnitario)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Total */}
      <div className="flex justify-end mb-8">
        <div className="w-64 border border-gray-200 rounded-lg overflow-hidden text-sm">
          <div className="flex justify-between px-4 py-2"><span className="text-gray-500">Serviço</span><span>{fmt(ordem.valorServico)}</span></div>
          <div className="flex justify-between px-4 py-2 border-t border-gray-100"><span className="text-gray-500">Peças</span><span>{fmt(ordem.valorPecas)}</span></div>
          <div className="flex justify-between px-4 py-2.5 bg-indigo-600 text-white font-bold"><span>TOTAL</span><span>{fmt(ordem.valorTotal)}</span></div>
        </div>
      </div>

      {/* Assinaturas */}
      <div className="grid grid-cols-2 gap-12 mt-10 pt-6 border-t border-gray-200">
        <div className="text-center">
          <div className="border-b border-gray-400 pb-10 mb-2" />
          <p className="text-xs text-gray-400">Assinatura do Técnico</p>
          <p className="text-sm mt-1">{ordem.tecnico?.name || '___________________'}</p>
        </div>
        <div className="text-center">
          {ordem.assinaturaCliente
            ? <img src={ordem.assinaturaCliente} alt="Assinatura do Cliente" className="max-h-16 mx-auto mb-2 border-b border-gray-400" />
            : <div className="border-b border-gray-400 pb-10 mb-2" />}
          <p className="text-xs text-gray-400">Assinatura do Cliente</p>
          <p className="text-sm mt-1">{ordem.cliente?.nome}</p>
        </div>
      </div>

      {/* Print button */}
      <div className="mt-8 text-center print:hidden">
        <button onClick={() => window.print()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
          🖨️ Imprimir / Salvar PDF
        </button>
      </div>
    </div>
  )
}
