import { prisma } from '@/lib/prisma'
import { TIPO_EQUIPAMENTO } from '@/lib/utils'
import Link from 'next/link'

export default async function EquipamentosPage() {
  const equipamentos = await prisma.equipamento.findMany({
    orderBy: { createdAt: 'desc' },
    include: { cliente: { select: { nome: true } }, _count: { select: { ordens: true } } },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Equipamentos</h1>
          <p className="text-muted-foreground text-sm">{equipamentos.length} equipamentos cadastrados</p>
        </div>
        <Link
          href="/equipamentos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
        >
          <span className="text-lg leading-none">+</span> Novo Equipamento
        </Link>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Tipo', 'Marca / Modelo', 'Nº Série', 'Cliente', 'OS', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {equipamentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                  Nenhum equipamento cadastrado
                </td>
              </tr>
            ) : (
              equipamentos.map((e) => (
                <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm">
                    {TIPO_EQUIPAMENTO[e.tipo as keyof typeof TIPO_EQUIPAMENTO]?.icon}{' '}
                    {TIPO_EQUIPAMENTO[e.tipo as keyof typeof TIPO_EQUIPAMENTO]?.label || e.tipo}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {e.marca} {e.modelo}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground font-mono">
                    {e.numeroSerie || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm">{e.cliente?.nome}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-primary">{e._count.ordens}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/equipamentos/${e.id}/editar`}
                      className="text-xs px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
