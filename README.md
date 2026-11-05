# ⚡ OSync — Sistema de Gestão de Ordens de Serviço (OS)

> Uma plataforma moderna, robusta e intuitiva para gerenciamento completo de Ordens de Serviço, Clientes, Equipamentos e Estoque de Peças — com visual dark futurista, suporte a tema claro/escuro e animações fluidas.

---

## 🌟 Principais Funcionalidades

- 🔐 **Autenticação & Controle de Acesso (RBAC):**
  - Perfis de **Administrador**, **Técnico** e **Atendente** com rotas e permissões protegidas.
- 📋 **Gestão de Ordens de Serviço:**
  - Fluxo de status com stepper interativo: `Aberta` → `Em andamento` → `Aguardando peça` → `Concluída` → `Entregue` → `Cancelada`.
  - Níveis de prioridade (`Baixa`, `Média`, `Alta`, `Urgente`).
  - Laudo técnico e financeiro (serviços + peças).
- 👥 **Cadastro de Clientes & Equipamentos:**
  - Histórico de serviços por cliente e equipamento vinculado.
- 📦 **Controle de Peças & Estoque:**
  - Gestão de quantidade em estoque com alerta visual automático de estoque baixo.
- 📊 **Dashboard com Métricas em Tempo Real:**
  - Gráficos de evolução mensal de OS, faturamento e distribuição por status.
- 🖨️ **Geração de Relatório / PDF:**
  - Visualização formatada para impressão e download de OS com campo para assinaturas.
- 🎨 **UI Moderna & Temas:**
  - Dark mode por padrão com background escuro (#0A0A0F), tema claro alternável, glassmorphism e animações com Framer Motion.

---

## 🛠️ Tecnologias Utilizadas

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Server Components & Server Actions)
- **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
- **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
- **Componentes & Ícones:** [Radix UI](https://www.radix-ui.com/) & [Lucide React](https://lucide.dev/)
- **Animações:** [Framer Motion](https://www.framer.com/motion/)
- **Banco de Dados & ORM:** SQLite (desenvolvimento ágil) & [Prisma ORM](https://www.prisma.io/)
- **Autenticação:** [NextAuth.js v5](https://authjs.dev/)
- **Gráficos:** [Recharts](https://recharts.org/)
- **Validação:** [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

---

## 🗄️ Arquitetura e Modelagem do Banco de Dados

Consulte a documentação completa com diagrama ERD, dicionário de dados e regras de negócio em:  
👉 [docs/DATABASE.md](docs/DATABASE.md)

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Julio-rgb863/OSync.git
   cd OSync
   ```

2. **Instale as dependências:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configure as variáveis de ambiente:**
   Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

4. **Prepare o banco de dados e dados iniciais:**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🛠️ Comandos Úteis do Banco de Dados

| Comando | Descrição |
|---|---|
| `npm run db:studio` | Abre a interface visual web do Prisma no navegador (`http://localhost:5555`) |
| `npm run db:push` | Aplica alterações do `prisma/schema.prisma` no banco |
| `npm run db:seed` | Popula o banco com clientes, equipamentos, OS e peças de teste |
| `npm run db:reset` | Zera o banco e executa o seed novamente |
| `npm run db:generate` | Regera os tipos TypeScript do Prisma Client |

---

## 🔑 Credenciais de Demonstração

| Perfil | Email | Senha |
|---|---|---|
| **Administrador** | `admin@osync.com` | `admin123` |
| **Técnico** | `tecnico@osync.com` | `tech123` |
| **Atendente** | `atendente@osync.com` | `atend123` |

---

## 📄 Licença

Distribuído sob a licença MIT. Sinta-se livre para usar e adaptar para seus estudos e portfólio!
