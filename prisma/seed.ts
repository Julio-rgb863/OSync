import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Limpar dados anteriores para permitir re-seed
  await prisma.anexoOS.deleteMany()
  await prisma.comentarioOS.deleteMany()
  await prisma.historicoOS.deleteMany()
  await prisma.pecaOS.deleteMany()
  await prisma.ordemDeServico.deleteMany()
  await prisma.anexoEquipamento.deleteMany()
  await prisma.equipamento.deleteMany()
  await prisma.cliente.deleteMany()
  await prisma.peca.deleteMany()

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@osync.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@osync.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'ADMIN',
    },
  })

  // Técnico
  const tecnico = await prisma.user.upsert({
    where: { email: 'tecnico@osync.com' },
    update: {},
    create: {
      name: 'João Silva',
      email: 'tecnico@osync.com',
      password: await bcrypt.hash('tech123', 12),
      role: 'TECNICO',
    },
  })

  // Atendente
  await prisma.user.upsert({
    where: { email: 'atendente@osync.com' },
    update: {},
    create: {
      name: 'Ana Costa',
      email: 'atendente@osync.com',
      password: await bcrypt.hash('atend123', 12),
      role: 'ATENDENTE',
    },
  })

  // Clientes
  const c1 = await prisma.cliente.create({
    data: { nome: 'Maria Santos', email: 'maria@email.com', telefone: '(11) 99999-0001', cpfCnpj: '123.456.789-00', cidade: 'São Paulo', estado: 'SP' },
  })
  const c2 = await prisma.cliente.create({
    data: { nome: 'Empresa Tech Ltda', email: 'contato@techltda.com', telefone: '(11) 3333-4444', cpfCnpj: '12.345.678/0001-90', cidade: 'São Paulo', estado: 'SP' },
  })
  const c3 = await prisma.cliente.create({
    data: { nome: 'Carlos Oliveira', email: 'carlos@email.com', telefone: '(21) 98888-7777', cidade: 'Rio de Janeiro', estado: 'RJ' },
  })

  // Equipamentos
  const e1 = await prisma.equipamento.create({
    data: { clienteId: c1.id, tipo: 'NOTEBOOK', marca: 'Dell', modelo: 'Inspiron 15', numeroSerie: 'DL12345ABC', descricao: 'Notebook 8GB RAM 256GB SSD' },
  })
  const e2 = await prisma.equipamento.create({
    data: { clienteId: c2.id, tipo: 'IMPRESSORA', marca: 'HP', modelo: 'LaserJet Pro M404', numeroSerie: 'HP789XYZ' },
  })
  const e3 = await prisma.equipamento.create({
    data: { clienteId: c3.id, tipo: 'CELULAR', marca: 'Samsung', modelo: 'Galaxy S23', numeroSerie: 'SM-S911B123' },
  })

  // OS
  const os1 = await prisma.ordemDeServico.create({
    data: {
      numero: 1,
      clienteId: c1.id, equipamentoId: e1.id, tecnicoId: tecnico.id,
      status: 'EM_ANDAMENTO', prioridade: 'ALTA',
      descricaoProblema: 'Notebook não liga. Ao pressionar o botão, nada acontece. Sem LEDs, sem sinal de vida.',
      valorServico: 150, valorTotal: 150,
    },
  })
  await prisma.historicoOS.create({
    data: { osId: os1.id, userId: admin.id, statusAnterior: 'ABERTA', statusNovo: 'EM_ANDAMENTO', observacao: 'Técnico iniciou diagnóstico' },
  })

  const os2 = await prisma.ordemDeServico.create({
    data: {
      numero: 2,
      clienteId: c2.id, equipamentoId: e2.id,
      status: 'AGUARDANDO_PECA', prioridade: 'MEDIA',
      descricaoProblema: 'Impressora com papel preso constantemente. Atolamento frequente.',
      laudoTecnico: 'Rolo de tração desgastado. Necessário substituição urgente.',
      valorServico: 80, valorPecas: 120, valorTotal: 200,
      aprovadoPeloCliente: true,
    },
  })
  await prisma.historicoOS.create({
    data: { osId: os2.id, userId: admin.id, statusNovo: 'ABERTA', observacao: 'OS aberta pelo atendente' },
  })

  const os3 = await prisma.ordemDeServico.create({
    data: {
      numero: 3,
      clienteId: c3.id, equipamentoId: e3.id,
      status: 'CONCLUIDA', prioridade: 'URGENTE',
      descricaoProblema: 'Celular caiu na água. Tela piscando e não responde ao toque.',
      laudoTecnico: 'Dano por líquido. Substituição de display e conector de carga. Limpeza de placa.',
      valorServico: 200, valorPecas: 350, valorTotal: 550,
      aprovadoPeloCliente: true, dataConclusao: new Date(),
    },
  })
  await prisma.historicoOS.create({
    data: { osId: os3.id, userId: tecnico.id, statusAnterior: 'EM_ANDAMENTO', statusNovo: 'CONCLUIDA', observacao: 'Serviço concluído com sucesso' },
  })

  // Peças
  await prisma.peca.createMany({
    data: [
      { nome: 'HD 1TB SATA', codigo: 'HD-1TB', quantidade: 5, estoqueMinimo: 2, precoCompra: 180, precoVenda: 280 },
      { nome: 'Memória RAM 8GB DDR4', codigo: 'RAM-8GB', quantidade: 10, estoqueMinimo: 3, precoCompra: 120, precoVenda: 200 },
      { nome: 'Rolo de Tração HP', codigo: 'RT-HP-001', quantidade: 1, estoqueMinimo: 2, precoCompra: 85, precoVenda: 130 },
      { nome: 'Display Samsung S23', codigo: 'DS-S23', quantidade: 2, estoqueMinimo: 1, precoCompra: 280, precoVenda: 420 },
      { nome: 'Pasta Térmica', codigo: 'PT-001', quantidade: 20, estoqueMinimo: 5, precoCompra: 8, precoVenda: 15 },
      { nome: 'SSD 256GB NVMe', codigo: 'SSD-256', quantidade: 0, estoqueMinimo: 2, precoCompra: 150, precoVenda: 250 },
    ],
  })

  console.log('✅ Seed concluído!')
  console.log('👤 Admin: admin@osync.com / admin123')
  console.log('🔧 Técnico: tecnico@osync.com / tech123')
  console.log('📋 Atendente: atendente@osync.com / atend123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
