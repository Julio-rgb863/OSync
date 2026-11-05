import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { EquipamentoForm } from '@/components/equipamentos/equipamento-form'

interface Props { params: Promise<{ id: string }> }

export default async function EditarEquipamentoPage({ params }: Props) {
  const { id } = await params
  const [equipamento, clientes] = await Promise.all([
    prisma.equipamento.findUnique({ where: { id } }),
    prisma.cliente.findMany({ where: { ativo: true }, select: { id: true, nome: true }, orderBy: { nome: 'asc' } }),
  ])

  if (!equipamento) notFound()

  return (
    <EquipamentoForm
      equipamentoId={id}
      clientes={clientes}
      initialData={{
        clienteId: equipamento.clienteId,
        tipo: equipamento.tipo,
        marca: equipamento.marca ?? '',
        modelo: equipamento.modelo ?? '',
        numeroSerie: equipamento.numeroSerie ?? '',
        descricao: equipamento.descricao ?? '',
        senha: equipamento.senha ?? '',
        acessorios: equipamento.acessorios ?? '',
      }}
    />
  )
}
