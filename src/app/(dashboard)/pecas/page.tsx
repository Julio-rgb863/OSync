import { prisma } from '@/lib/prisma'

export default async function PecasPage() {
  const pecas = await prisma.peca.findMany({ where: { ativo: true }, orderBy: { nome: 'asc' } })
  const baixoEstoque = pecas.filter(p => p.quantidade <= p.estoqueMinimo)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Peças / Estoque</h1>
          <p className="text-muted-foreground text-sm">{pecas.length} itens · {baixoEstoque.length} com estoque baixo</p>
        </div>
      </div>
      {baixoEstoque.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          ⚠️ <strong>{baixoEstoque.length} item(s)</strong> com estoque abaixo do mínimo: {baixoEstoque.map(p => p.nome).join(', ')}
        </div>
      )}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              {['Código', 'Nome', 'Estoque', 'Mín.', 'Pr. Compra', 'Pr. Venda', 'Status'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pecas.map(p => {
              const baixo = p.quantidade <= p.estoqueMinimo
              return (
                <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-mono text-muted-foreground">{p.codigo || '—'}</td>
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium">{p.nome}</p>
                    {p.descricao && <p className="text-xs text-muted-foreground">{p.descricao}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${baixo ? 'text-red-400' : 'text-emerald-400'}`}>{p.quantidade}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.estoqueMinimo}</td>
                  <td className="px-4 py-3 text-sm">R$ {p.precoCompra.toFixed(2)}</td>
                  <td className="px-4 py-3 text-sm font-medium text-primary">R$ {p.precoVenda.toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full border ${baixo ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                      {baixo ? '⚠ Baixo' : '✓ OK'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
