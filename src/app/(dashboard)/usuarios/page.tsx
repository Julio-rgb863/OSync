import { prisma } from '@/lib/prisma'
import { ROLE_LABELS } from '@/lib/utils'

export default async function UsuariosPage() {
  const usuarios = await prisma.user.findMany({ where: { ativo: true }, orderBy: { name: 'asc' } })
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Usuários</h1>
        <p className="text-muted-foreground text-sm">{usuarios.length} usuários cadastrados</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {usuarios.map(u => (
          <div key={u.id} className="p-5 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">{u.name.charAt(0)}</span>
              </div>
              <div>
                <p className="font-semibold">{u.name}</p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 mt-1 inline-block">
                  {ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
