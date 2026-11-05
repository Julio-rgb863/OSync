# 🗄️ Modelagem do Banco de Dados — OSync

Documento de referência da arquitetura do banco de dados relacional do **OSync**, preparado para suporte ao levantamento de requisitos, expansão de funcionalidades e manutenção colaborativa.

---

## 📊 Diagrama de Entidade-Relacionamento (ERD)

```mermaid
erDiagram
    User ||--o{ OrdemDeServico : "atribuido_como_tecnico"
    User ||--o{ HistoricoOS : "registrou_historico"
    User ||--o{ ComentarioOS : "publicou_comentario"
    User ||--o{ Account : "possui_contas"
    User ||--o{ Session : "possui_sessoes"

    Cliente ||--o{ Equipamento : "possui_equipamentos"
    Cliente ||--o{ OrdemDeServico : "solicitou_os"

    Equipamento ||--o{ OrdemDeServico : "alvo_da_os"
    Equipamento ||--o{ AnexoEquipamento : "fotos_e_documentos"

    OrdemDeServico ||--o{ HistoricoOS : "trilha_de_auditoria"
    OrdemDeServico ||--o{ ComentarioOS : "mensagens_e_notas"
    OrdemDeServico ||--o{ PecaOS : "itens_utilizados"
    OrdemDeServico ||--o{ AnexoOS : "fotos_antes_depois"

    Peca ||--o{ PecaOS : "vinculada_a_os"
```

---

## 🏗️ Dicionário de Dados

### 1. `User` (Usuários do Sistema)
Armazena os colaboradores internos que acessam o sistema.
| Campo | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | String (CUID) | Não | Identificador único |
| `name` | String | Não | Nome completo |
| `email` | String | Não | Email único de login |
| `password` | String | Sim | Hash bcrypt da senha |
| `role` | String | Não | Perfil: `ADMIN`, `TECNICO`, `ATENDENTE` |
| `ativo` | Boolean | Não | Status de ativação (default: `true`) |
| `createdAt` / `updatedAt` | DateTime | Não | Timestamps de auditoria |

---

### 2. `Cliente` (Clientes & Contratantes)
Pessoa física ou jurídica dona dos equipamentos atendidos.
| Campo | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | String (CUID) | Não | Identificador único |
| `nome` | String | Não | Nome ou Razão Social |
| `email` | String | Sim | Contato por email |
| `telefone` | String | Sim | Telefone / WhatsApp |
| `cpfCnpj` | String | Sim | CPF ou CNPJ |
| `endereco` | String | Sim | Logradouro e número |
| `cidade` | String | Sim | Cidade |
| `estado` | String | Sim | UF (ex: SP, RJ) |
| `cep` | String | Sim | Código postal |
| `observacoes` | String | Sim | Observações comerciais/especiais |
| `ativo` | Boolean | Não | Soft delete (default: `true`) |

---

### 3. `Equipamento` (Itens em Atendimento)
Dispositivos pertencentes ao cliente que necessitam de reparo ou manutenção.
| Campo | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | String (CUID) | Não | Identificador único |
| `clienteId` | String (FK) | Não | Referência ao cliente proprietário |
| `tipo` | String | Não | `COMPUTADOR`, `NOTEBOOK`, `IMPRESSORA`, `CELULAR`, `TABLET`, `MAQUINA`, `OUTRO` |
| `marca` | String | Sim | Fabricante (Dell, HP, Samsung, etc.) |
| `modelo` | String | Sim | Modelo específico |
| `numeroSerie` | String | Sim | Número de série para identificação inequívoca |
| `descricao` | String | Sim | Especificações (RAM, Processador, cor, etc.) |
| `senha` | String | Sim | Senha do dispositivo (se necessária para testes) |
| `acessorios` | String | Sim | Acessórios deixados junto (fonte, capa, cabo, etc.) |

---

### 4. `OrdemDeServico` (Entidade Central)
Representa o ciclo de vida completo de uma OS.
| Campo | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | String (CUID) | Não | Identificador único |
| `numero` | Int | Não | Número sequencial único exibido ao cliente |
| `clienteId` | String (FK) | Não | Cliente solicitante |
| `equipamentoId` | String (FK) | Sim | Equipamento relacionado (opcional) |
| `tecnicoId` | String (FK) | Sim | Técnico responsável atribuído |
| `status` | String | Não | `ABERTA`, `EM_ANDAMENTO`, `AGUARDANDO_PECA`, `CONCLUIDA`, `ENTREGUE`, `CANCELADA` |
| `prioridade` | String | Não | `BAIXA`, `MEDIA`, `ALTA`, `URGENTE` |
| `descricaoProblema`| String | Não | Relato do defeito pelo cliente |
| `laudoTecnico` | String | Sim | Parecer do diagnóstico emitido pelo técnico |
| `observacoesInternas`| String | Sim | Anotações visíveis apenas à equipe |
| `valorServico` | Float | Não | Custo de mão de obra (default: 0) |
| `valorPecas` | Float | Não | Custo acumulado de peças (default: 0) |
| `valorTotal` | Float | Não | `valorServico` + `valorPecas` |
| `aprovadoPeloCliente`| Boolean | Sim | Se o orçamento foi autorizado |
| `dataAprovacao` | DateTime | Sim | Data da autorização do orçamento |
| `assinaturaCliente`| String | Sim | Assinatura digital (base64) |
| `dataPrazo` | DateTime | Sim | Prazo prometido de entrega |
| `dataConclusao` | DateTime | Sim | Data em que o reparo foi finalizado |
| `dataEntrega` | DateTime | Sim | Data em que o item foi devolvido ao cliente |

---

### 5. `HistoricoOS` (Auditoria & Rastreabilidade)
Registra cada mudança de status e quem a efetuou (compliance).
| Campo | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | String (CUID) | Não | Identificador único |
| `osId` | String (FK) | Não | Referência à OS |
| `userId` | String (FK) | Não | Usuário que fez a alteração |
| `statusAnterior` | String | Sim | Status que foi substituído |
| `statusNovo` | String | Sim | Novo status aplicado |
| `observacao` | String | Sim | Motivo ou nota da mudança |
| `createdAt` | DateTime | Não | Momento exato da alteração |

---

### 6. `ComentarioOS` (Linha do Tempo / Timeline)
Comentários e notas de andamento deixados pela equipe durante o atendimento.
| Campo | Tipo | Nulo | Descrição |
|---|---|---|---|
| `id` | String (CUID) | Não | Identificador único |
| `osId` | String (FK) | Não | Referência à OS |
| `userId` | String (FK) | Não | Autor do comentário |
| `texto` | String | Não | Conteúdo da mensagem |
| `interno` | Boolean | Não | Se é comentário privado da equipe |
| `createdAt` | DateTime | Não | Data e hora da publicação |

---

### 7. `Peca` & `PecaOS` (Estoque e Peças Usadas)
- **`Peca`**: Itens no inventário (código, quantidade em estoque, estoque mínimo de alerta, preços).
- **`PecaOS`**: Tabela associativa n:m registrando quais peças foram alocadas a uma OS com a quantidade e o preço cobrado na época.

---

### 8. `AnexoOS` & `AnexoEquipamento`
Armazenamento de referências de arquivos (fotos de entrada do aparelho, comprovantes, PDFs, fotos do defeito).

---

## 🔄 Fluxo de Status da Ordem de Serviço (Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> ABERTA : Atendente ou Cliente cadastra OS
    ABERTA --> EM_ANDAMENTO : Técnico assume e inicia diagnóstico
    ABERTA --> CANCELADA : Cliente desiste do serviço

    EM_ANDAMENTO --> AGUARDANDO_PECA : Necessário componente externo
    AGUARDANDO_PECA --> EM_ANDAMENTO : Peça recebida em estoque

    EM_ANDAMENTO --> CONCLUIDA : Reparo finalizado e testado com sucesso
    CONCLUIDA --> ENTREGUE : Cliente retira o equipamento / pagamento realizado
    
    EM_ANDAMENTO --> CANCELADA : Orçamento reprovado
    ENTREGUE --> [*]
    CANCELADA --> [*]
```

---

## 🛠️ Comandos Rápidos do Banco de Dados

Para facilitar o trabalho de desenvolvimento e levantamento de requisitos, execute no terminal:

```bash
# 1. Abrir interface visual web completa do banco no navegador (porta 5555)
npm run db:studio

# 2. Atualizar o banco após editar prisma/schema.prisma
npm run db:push

# 3. Regerar tipos do Prisma Client
npm run db:generate

# 4. Popular o banco com dados de teste realistas
npm run db:seed

# 5. Resetar banco do zero e repovoar automaticamente
npm run db:reset
```

---

## ☁️ Como Migrar para PostgreSQL (Produção / Supabase / Docker)

O schema foi projetado de forma neutra para rodar tanto em **SQLite** (localmente, zero configuração) quanto em **PostgreSQL**:

1. No arquivo `prisma/schema.prisma`, altere o datasource:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. No arquivo `.env`, altere para a connection string do PostgreSQL:
   ```env
   DATABASE_URL="postgresql://usuario:senha@localhost:5432/osync?schema=public"
   ```
3. Execute:
   ```bash
   npm run db:push
   npm run db:seed
   ```
Pronto! Toda a estrutura e os dados migram sem alterar nenhuma linha de código da aplicação.
