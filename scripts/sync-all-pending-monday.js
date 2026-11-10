const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const token = process.env.MONDAY_API_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjcyMjc5Nzg2MSwiYWFpIjoxMSwidWlkIjoxMjE2MjkxMzIsImlhZCI6IjIwMjYtMTEtMTBUMjE6Mjk6MzQuNjMzWiIsInBlciI6Im1lOndyaXRlIiwiYWN0aWQiOjM3NjgxMTIzLCJyZ24iOiJ1c2UxIn0.vmVkGsmfEydC6rQCMrlldQaFprfO1POsG1EpP9MRoh4';
const boardId = process.env.MONDAY_BOARD_ID || '18439403289';

function mapStatusToMonday(status) {
  switch (status) {
    case 'CONCLUIDA':
    case 'ENTREGUE':
      return 'Feito';
    case 'EM_ANDAMENTO':
      return 'Em andamento';
    case 'AGUARDANDO_PECA':
    case 'CANCELADA':
      return 'Parado';
    case 'ABERTA':
    default:
      return 'Não iniciado';
  }
}

function mapPriorityToMonday(priority) {
  switch (priority) {
    case 'URGENTE':
      return 'Crítico ⚠️️';
    case 'ALTA':
      return 'Alta';
    case 'BAIXA':
      return 'Baixa';
    case 'MEDIA':
    default:
      return 'Média';
  }
}

async function createOrUpdateItemInMonday(ordem) {
  const itemName = `OS #${String(ordem.numero).padStart(4, '0')} — ${ordem.cliente?.nome || 'Cliente'}`;

  const columnValues = {
    project_status: { label: mapStatusToMonday(ordem.status) },
    priority_1: { label: mapPriorityToMonday(ordem.prioridade) },
    numbers: Number(ordem.valorTotal) || 0,
    text9: `${ordem.equipamento ? `${ordem.equipamento.marca || ''} ${ordem.equipamento.modelo || ''} - ` : ''}${ordem.descricaoProblema}`.slice(0, 255),
  };

  if (ordem.dataPrazo) {
    columnValues.date = { date: new Date(ordem.dataPrazo).toISOString().split('T')[0] };
  }

  const mutation = `
    mutation CreateItem($boardId: ID!, $itemName: String!, $colVals: JSON!) {
      create_item(board_id: $boardId, item_name: $itemName, column_values: $colVals) {
        id
        name
      }
    }
  `;

  const res = await fetch('https://api.monday.com/v2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token,
      'API-Version': '2024-01'
    },
    body: JSON.stringify({
      query: mutation,
      variables: {
        boardId,
        itemName,
        colVals: JSON.stringify(columnValues)
      }
    })
  });

  const json = await res.json();
  if (json.errors) {
    throw new Error(json.errors.map(e => e.message).join(', '));
  }
  return json.data.create_item;
}

async function main() {
  console.log('Buscando ordens de serviço pendentes no OSync...');

  // Busca OS pendentes (não concluídas/canceladas/entregues)
  const pendentes = await prisma.ordemDeServico.findMany({
    where: {
      status: { in: ['ABERTA', 'EM_ANDAMENTO', 'AGUARDANDO_PECA'] }
    },
    include: { cliente: true, equipamento: true, tecnico: true },
    orderBy: { numero: 'asc' }
  });

  console.log(`Encontradas ${pendentes.length} OS pendentes no sistema:`);

  const results = [];

  for (const os of pendentes) {
    console.log(`\nSincronizando OS #${os.numero} (${os.cliente?.nome})...`);
    console.log(`Status: ${os.status} | Prioridade: ${os.prioridade} | Valor: R$ ${os.valorTotal}`);
    
    try {
      const mondayItem = await createOrUpdateItemInMonday(os);
      console.log(`✓ Criado no monday.com com ID: ${mondayItem.id}`);

      // Atualiza o mondayItemId no banco de dados
      await prisma.ordemDeServico.update({
        where: { id: os.id },
        data: { mondayItemId: mondayItem.id }
      });

      results.push({
        numero: os.numero,
        cliente: os.cliente?.nome,
        status: os.status,
        mondayId: mondayItem.id,
        ok: true
      });
    } catch (err) {
      console.error(`✗ Erro ao sincronizar OS #${os.numero}:`, err.message);
      results.push({
        numero: os.numero,
        cliente: os.cliente?.nome,
        error: err.message,
        ok: false
      });
    }
  }

  console.log('\n--- RESUMO DA SINCRONIZAÇÃO COM O MONDAY.COM ---');
  console.table(results);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
