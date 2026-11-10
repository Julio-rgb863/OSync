/**
 * OSync Enterprise — monday.com GraphQL API v2 Client
 * Integração nativa bidirecional para Work OS, Projetos e Ordens de Serviço
 */

import { prisma } from '@/lib/prisma'

const MONDAY_API_URL = 'https://api.monday.com/v2'

interface GraphQLResponse<T> {
  data?: T
  errors?: Array<{ message: string; extensions?: Record<string, unknown> }>
  error_message?: string
}

export class MondayClient {
  private token: string

  constructor(token?: string) {
    this.token = token || process.env.MONDAY_API_TOKEN || ''
  }

  /**
   * Executa uma consulta GraphQL na API v2 do monday.com
   */
  async query<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const activeToken = this.token || process.env.MONDAY_API_TOKEN || ''
    if (!activeToken) {
      throw new Error('Token do monday.com não configurado. Defina MONDAY_API_TOKEN no .env.')
    }

    const response = await fetch(MONDAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: activeToken,
        'API-Version': '2024-01',
      },
      body: JSON.stringify({ query, variables }),
      cache: 'no-store',
    })

    const result: GraphQLResponse<T> = await response.json()

    if (result.errors && result.errors.length > 0) {
      const msg = result.errors.map((e) => e.message).join(' | ')
      throw new Error(`Erro na API do monday.com: ${msg}`)
    }

    if (!result.data) {
      throw new Error(result.error_message || 'Resposta vazia da API do monday.com')
    }

    return result.data
  }

  /**
   * Testa a conectividade e autenticação do token
   */
  async testConnection(): Promise<{ id: string; name: string; email: string }> {
    const data = await this.query<{ me: { id: string; name: string; email: string } }>(`
      query {
        me {
          id
          name
          email
        }
      }
    `)
    return data.me
  }

  /**
   * Lista os quadros (boards) acessíveis na conta
   */
  async getBoards(limit = 10): Promise<Array<{ id: string; name: string; state: string }>> {
    const data = await this.query<{ boards: Array<{ id: string; name: string; state: string }> }>(`
      query GetBoards($limit: Int!) {
        boards(limit: $limit) {
          id
          name
          state
        }
      }
    `, { limit })
    return data.boards
  }

  /**
   * Cria um item no monday.com
   */
  async createItem(params: {
    boardId: string
    groupId?: string
    itemName: string
    columnValues?: Record<string, unknown>
  }): Promise<{ id: string; name: string }> {
    const mutation = `
      mutation CreateItem($boardId: ID!, $groupId: String, $itemName: String!, $columnValues: JSON) {
        create_item(
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
          name
        }
      }
    `

    const data = await this.query<{ create_item: { id: string; name: string } }>(mutation, {
      boardId: params.boardId,
      groupId: params.groupId,
      itemName: params.itemName,
      columnValues: params.columnValues ? JSON.stringify(params.columnValues) : undefined,
    })

    return data.create_item
  }

  /**
   * Atualiza as colunas de um item no monday.com
   */
  async updateItemColumns(params: {
    boardId: string
    itemId: string
    columnValues: Record<string, unknown>
  }): Promise<{ id: string }> {
    const mutation = `
      mutation ChangeColumns($boardId: ID!, $itemId: ID!, $columnValues: JSON!) {
        change_multiple_column_values(
          board_id: $boardId,
          item_id: $itemId,
          column_values: $columnValues
        ) {
          id
        }
      }
    `

    const data = await this.query<{ change_multiple_column_values: { id: string } }>(mutation, {
      boardId: params.boardId,
      itemId: params.itemId,
      columnValues: JSON.stringify(params.columnValues),
    })

    return data.change_multiple_column_values
  }
}

export const mondayClient = new MondayClient()

/**
 * Mapeia status do OSync para o monday.com
 */
function mapStatusToMonday(status: string): string {
  switch (status) {
    case 'CONCLUIDA':
    case 'ENTREGUE':
      return 'Feito'
    case 'EM_ANDAMENTO':
    case 'AGUARDANDO_PECA':
      return 'Trabalhando nisso'
    case 'CANCELADA':
      return 'Parado'
    default:
      return 'Pronto para iniciar'
  }
}

/**
 * Mapeia prioridade do OSync para o monday.com
 */
function mapPriorityToMonday(priority: string): string {
  switch (priority) {
    case 'URGENTE':
      return 'Crítico'
    case 'ALTA':
      return 'Alto'
    case 'BAIXA':
      return 'Baixo'
    default:
      return 'Médio'
  }
}

/**
 * Sincroniza uma Ordem de Serviço com o quadro "Osync" no monday.com
 */
export async function syncOrdemServicoToMonday(osId: string): Promise<{ ok: boolean; mondayItemId?: string; error?: string }> {
  try {
    const boardId = process.env.MONDAY_BOARD_ID || '18439403289'
    const ordem = await prisma.ordemDeServico.findUnique({
      where: { id: osId },
      include: { cliente: true, equipamento: true, tecnico: true },
    })

    if (!ordem) return { ok: false, error: 'OS não encontrada' }

    const itemName = `OS #${String(ordem.numero).padStart(4, '0')} — ${ordem.cliente?.nome || 'Cliente'}`

    // Monta valores das colunas de acordo com o quadro do monday.com
    const columnValues: Record<string, unknown> = {
      project_status: { label: mapStatusToMonday(ordem.status) },
      priority_1: { label: mapPriorityToMonday(ordem.prioridade) },
      numbers: ordem.valorTotal || 0,
      text9: `${ordem.equipamento ? `${ordem.equipamento.marca || ''} ${ordem.equipamento.modelo || ''} - ` : ''}${ordem.descricaoProblema}`.slice(0, 255),
    }

    if (ordem.dataPrazo) {
      columnValues.date = { date: ordem.dataPrazo.toISOString().split('T')[0] }
    }

    if (ordem.mondayItemId) {
      // Atualiza item existente
      await mondayClient.updateItemColumns({
        boardId,
        itemId: ordem.mondayItemId,
        columnValues,
      })
      return { ok: true, mondayItemId: ordem.mondayItemId }
    } else {
      // Cria novo item no monday.com
      const created = await mondayClient.createItem({
        boardId,
        itemName,
        columnValues,
      })

      // Salva o mondayItemId no banco do OSync
      await prisma.ordemDeServico.update({
        where: { id: osId },
        data: { mondayItemId: created.id },
      })

      return { ok: true, mondayItemId: created.id }
    }
  } catch (error: any) {
    console.error('[monday.com sync error]:', error.message)
    return { ok: false, error: error.message }
  }
}
