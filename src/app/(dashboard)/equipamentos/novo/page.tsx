import { prisma } from '@/lib/prisma'
import { EquipamentoForm } from '@/components/equipamentos/equipamento-form'

export default async function NovoEquipamentoPage() {
  const clientes = await prisma.cliente.findMany({
    where: { ativo: true },
    select: { id: true, nome: true },
    orderBy: { nome: 'asc' },
  })

  return <EquipamentoForm clientes={clientes} />
}
