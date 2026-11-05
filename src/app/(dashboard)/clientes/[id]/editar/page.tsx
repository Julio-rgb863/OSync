import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ClienteForm } from '@/components/clientes/cliente-form'

interface Props { params: Promise<{ id: string }> }

export default async function EditarClientePage({ params }: Props) {
  const { id } = await params
  const cliente = await prisma.cliente.findUnique({ where: { id } })
  if (!cliente) notFound()

  return (
    <ClienteForm
      clienteId={id}
      initialData={{
        nome: cliente.nome,
        email: cliente.email ?? '',
        telefone: cliente.telefone ?? '',
        cpfCnpj: cliente.cpfCnpj ?? '',
        endereco: cliente.endereco ?? '',
        cidade: cliente.cidade ?? '',
        estado: cliente.estado ?? '',
        cep: cliente.cep ?? '',
        observacoes: cliente.observacoes ?? '',
      }}
    />
  )
}
