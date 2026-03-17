# DETRAN-RJ — Sistema de Gestão de Instrumentos Jurídicos

Sistema web fullstack para gerenciamento e controle de contratos, convênios e demais instrumentos jurídicos do **Departamento de Trânsito do Estado do Rio de Janeiro (DETRAN-RJ)**, desenvolvido com identidade visual oficial do Estado do Rio de Janeiro.

---

## Visão Geral

O sistema centraliza o ciclo de vida de todos os instrumentos jurídicos firmados pelo DETRAN-RJ com parceiros públicos e privados, permitindo o acompanhamento de vigências, alertas de vencimento, gestão de termos aditivos e monitoramento de conexões VPN (em fase de integração).

A base de dados inicial foi populada com **57 instrumentos reais** extraídos de documentos SEI, abrangendo contratos, convênios, acordos de cooperação técnica e termos de cooperação de diversas diretorias.

---

## Funcionalidades

### Instrumentos Jurídicos
- Cadastro completo com número, tipo, partes envolvidas, objeto, datas de vigência, processo SEI e diretoria responsável
- Listagem com filtros por diretoria, tipo de instrumento e busca textual
- Paginação e ordenação por colunas
- Página de detalhes com barra de progresso de vigência e histórico de termos aditivos
- Indicadores visuais de status: **Vigente** (verde), **Próximo do Vencimento** (amarelo, < 180 dias) e **Vencido** (vermelho)
- Exportação para **PDF** e **Excel (CSV)**
- Formulário de criação e edição de instrumentos

### Dashboard
- KPIs: total de instrumentos, vigentes, próximos do vencimento e vencidos
- Gráfico de distribuição por diretoria
- Gráfico de distribuição por tipo de instrumento
- Gráfico de status de vigência
- Gráfico de distribuição por ano de início
- Painel de alertas integrado para instrumentos próximos do vencimento

### VPN (Demonstração)
- Listagem de conexões VPN com status em tempo real (mockup)
- Filtros por status e busca por nome/matrícula
- Página de detalhes por conexão com dados de rede e tráfego
- KPIs: total de usuários, conectados, desconectados e bloqueados
- Gráfico de distribuição de status

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + TypeScript + Tailwind CSS 4 |
| Componentes UI | shadcn/ui + Radix UI |
| Gráficos | Recharts |
| Roteamento | Wouter |
| Backend | Node.js + Express 4 |
| API | tRPC 11 (type-safe end-to-end) |
| ORM | Drizzle ORM |
| Banco de Dados | MySQL / TiDB |
| Autenticação | Manus OAuth (JWT + cookies) |
| Build | Vite 7 |
| Testes | Vitest |

---

## Estrutura do Projeto

```
detran-contratos/
├── client/
│   └── src/
│       ├── pages/
│       │   ├── Home.tsx              # Dashboard principal
│       │   ├── Instrumentos.tsx      # Listagem de instrumentos
│       │   ├── InstrumentoDetalhes.tsx  # Detalhes do instrumento
│       │   ├── InstrumentoForm.tsx   # Formulário criar/editar
│       │   ├── Vpn.tsx               # Listagem VPN
│       │   └── VpnDetalhes.tsx       # Detalhes da conexão VPN
│       ├── components/
│       │   └── DashboardLayout.tsx   # Layout com sidebar
│       ├── lib/
│       │   ├── utils-instrumentos.ts # Helpers de status e formatação
│       │   └── export-utils.ts       # Funções de exportação PDF/Excel
│       └── index.css                 # Tema visual (cores oficiais RJ)
├── server/
│   ├── routers.ts                    # Procedures tRPC
│   ├── db.ts                         # Queries do banco de dados
│   └── instrumentos.test.ts          # Testes unitários
├── drizzle/
│   └── schema.ts                     # Schema do banco de dados
└── seed-db.mjs                       # Script de importação dos 57 instrumentos
```

---

## Banco de Dados

### Tabela `instrumentos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INT PK | Identificador único |
| `numero` | VARCHAR(64) | Número do instrumento (ex: 039/2023) |
| `tipo` | VARCHAR(128) | Tipo: Contrato, Convênio, Acordo, Termo |
| `partesEnvolvidas` | TEXT | Partes signatárias |
| `objeto` | TEXT | Objeto do instrumento |
| `dataInicio` | BIGINT | Timestamp de início da vigência |
| `dataTermino` | BIGINT | Timestamp de término da vigência |
| `processoSei` | VARCHAR(128) | Número do processo no SEI |
| `diretoria` | VARCHAR(256) | Diretoria responsável |
| `arquivoOrigem` | VARCHAR(512) | Arquivo PDF de origem |

### Tabela `termos_aditivos`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INT PK | Identificador único |
| `instrumentoId` | INT FK | Referência ao instrumento |
| `descricao` | TEXT | Descrição do termo aditivo |
| `dataAditivo` | BIGINT | Data do termo aditivo |

### Tabela `vpn_conexoes`

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INT PK | Identificador único |
| `nomeUsuario` | VARCHAR(128) | Nome do usuário |
| `matricula` | VARCHAR(32) | Matrícula funcional |
| `diretoria` | VARCHAR(256) | Diretoria do usuário |
| `servidor` | VARCHAR(128) | Servidor VPN |
| `ipAtribuido` | VARCHAR(45) | IP atribuído na sessão |
| `status` | ENUM | `conectado`, `desconectado`, `bloqueado` |
| `ultimaConexao` | BIGINT | Timestamp da última conexão |
| `bytesEnviados` | BIGINT | Bytes enviados (upload) |
| `bytesRecebidos` | BIGINT | Bytes recebidos (download) |

---

## Diretorias Cadastradas

Os instrumentos estão organizados pelas seguintes diretorias:

- **Diretoria de Identificação Civil** — maior volume (39 instrumentos)
- **Diretoria de Registro de Veículos**
- **Diretoria de Habilitação**
- **Diretoria de Administração e Finanças**
- **Diretoria de Apoio Operacional**
- **Externo** — órgãos externos ao DETRAN (ERGE-RJ, SEPOL, MPRJ, OAB, TCE-RJ, etc.)

---

## Identidade Visual

O sistema segue o **Manual de Marca do Estado do Rio de Janeiro**, utilizando:

- **Azul institucional:** `#005A92` (cor primária)
- **Dourado:** `#BC9D32` (cor de destaque)
- **Verde:** `#427842` (cor de apoio)
- **Fonte:** Roboto (fonte de apoio oficial)

---

## Instalação e Execução Local

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd detran-contratos

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com DATABASE_URL e demais variáveis

# Executar migrations
pnpm drizzle-kit generate
pnpm drizzle-kit migrate

# Popular banco de dados com os 57 instrumentos
node seed-db.mjs

# Iniciar em modo desenvolvimento
pnpm dev
```

---

## Testes

```bash
pnpm test
```

Os testes cobrem as principais procedures tRPC: listagem de instrumentos, criação, edição, exclusão, listagem de termos aditivos e listagem de VPN.

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `DATABASE_URL` | String de conexão MySQL/TiDB |
| `JWT_SECRET` | Segredo para assinatura de cookies de sessão |
| `VITE_APP_ID` | ID da aplicação Manus OAuth |
| `OAUTH_SERVER_URL` | URL do servidor OAuth |
| `VITE_OAUTH_PORTAL_URL` | URL do portal de login |

---

## Próximos Passos

- [ ] Integração com dados reais de VPN (substituir mockup)
- [ ] Notificações automáticas por e-mail para vencimentos (30/60/90 dias)
- [ ] Relatório mensal em PDF por diretoria
- [ ] Importação de novos instrumentos via upload de PDF
- [ ] Histórico de alterações por instrumento (audit log)

---

## Licença

Uso interno — DETRAN-RJ / Governo do Estado do Rio de Janeiro.
