import { prisma } from '@/lib/prisma'
import { TIPO_EQUIPAMENTO } from '@/lib/utils'

export default async function EquipamentosPage() {
  const equipamentos = await prisma.equipamento.findMany({
    orderBy: { createdAt: 'desc' },
    include: { cliente: { select: { nome: true } }, _count: { select: { ordens: true } } },
  })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Equipamentos</h1>
        <p className="text-muted-foreground text-sm">{equipamentos.length} equipamentos cadastrados</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Tipo', 'Marca / Modelo', 'Nº Série', 'Cliente', 'OS'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {equipamentos.map(e => (
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm">
                  {TIPO_EQUIPAMENTO[e.tipo as keyof typeof TIPO_EQUIPAMENTO]?.icon} {TIPO_EQUIPAMENTO[e.tipo as keyof typeof TIPO_EQUIPAMENTO]?.label || e.tipo}
                </td>
                <td className="px-4 py-3 text-sm font-medium">{e.marca} {e.modelo}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{e.numeroSerie || '—'}</td>
                <td className="px-4 py-3 text-sm">{(e.cliente as any)?.nome}</td>
                <td className="px-4 py-3 text-sm font-semibold text-primary">{e._count.ordens}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
