<p align="center">
  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-logo-d-hq-dZzWBJ829VhnMFwpgVHjyS.png" alt="DETRAN-RJ Logo" width="120" />
</p>

<h1 align="center">🏛️ DETRAN-RJ — Sistema de Gestão de Instrumentos</h1>

<p align="center">
  <strong>Plataforma web completa para gestão de contratos, convênios, termos de cooperação e conexões VPN do Departamento de Trânsito do Estado do Rio de Janeiro.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?logo=trpc&logoColor=white" alt="tRPC 11" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-MySQL-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PWA-Instalável-5A0FC8?logo=pwa&logoColor=white" alt="PWA" />
</p>

---

## 📋 Índice

1. [Visão Geral](#-visão-geral)
2. [Funcionalidades](#-funcionalidades)
3. [Identidade Visual — Guia de Design](#-identidade-visual--guia-de-design)
4. [Arquitetura](#-arquitetura)
5. [Estrutura de Pastas](#-estrutura-de-pastas)
6. [Banco de Dados](#-banco-de-dados)
7. [Instalação PWA](#-instalação-pwa)
8. [Testes](#-testes)
9. [Versionamento e GitHub](#-versionamento-e-github)
10. [Melhores Práticas para Projetos DETRAN-RJ](#-melhores-práticas-para-projetos-detran-rj)
11. [Roadmap](#-roadmap)

---

## 🎯 Visão Geral

O **Sistema de Gestão de Instrumentos do DETRAN-RJ** é uma aplicação web moderna que centraliza o controle de todos os instrumentos jurídicos (contratos, convênios, termos de cooperação, acordos) e conexões VPN do Departamento de Trânsito do Estado do Rio de Janeiro.

O sistema oferece **dashboard interativo** com indicadores em tempo real, **alertas de vencimento**, **exportação de dados**, **gestão de anexos via S3** e **instalação como aplicativo** no celular via PWA. A base de dados inicial foi populada com **57 instrumentos reais** extraídos de documentos SEI, abrangendo contratos, convênios, acordos de cooperação técnica e termos de cooperação de diversas diretorias.

| Característica | Detalhe |
|---|---|
| **Stack Frontend** | React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui |
| **Stack Backend** | Express 4 + tRPC 11 + Drizzle ORM + MySQL/TiDB |
| **Autenticação** | Manus OAuth com sessão via cookie JWT |
| **Armazenamento** | S3 para anexos, MySQL para dados estruturados |
| **PWA** | Service Worker + Manifest + Splash Screen animada |
| **Testes** | Vitest com 15 testes unitários cobrindo todas as procedures |

---

## ✨ Funcionalidades

### 📊 Dashboard

O painel principal exibe uma visão consolidada de todos os instrumentos jurídicos com **cards KPI coloridos** (total, vigentes, próximos do vencimento, vencidos), gráficos interativos por diretoria e status de vigência, e indicadores de prazo médio. Cada card utiliza degradê nas cores oficiais do DETRAN-RJ para reforçar a identidade visual.

### 📄 Gestão de Instrumentos

Módulo completo de CRUD para instrumentos jurídicos com listagem paginada, filtros avançados (diretoria, tipo, status de vigência, período), ordenação por qualquer coluna, busca textual, exportação para CSV/Excel e visualização detalhada com barra de vigência visual. Os indicadores de status utilizam cores semânticas: **verde** para vigente, **dourado** para próximo do vencimento (< 180 dias), e **vermelho** para vencido.

### 📝 Termos Aditivos

Cada instrumento pode ter múltiplos termos aditivos vinculados, com data e descrição, exibidos em timeline cronológica na página de detalhes. A criação e exclusão de termos é protegida por autenticação.

### 🔒 Gestão de VPN

Módulo para controle de conexões VPN com status em tempo real (conectado, desconectado, bloqueado), estatísticas de tráfego (bytes enviados/recebidos), filtros por diretoria e status, e página de detalhes por conexão.

### 📎 Anexos

Sistema de upload de arquivos vinculados a instrumentos ou conexões VPN, com armazenamento em S3, validação de tipos permitidos (bloqueia .exe, .bat, .cmd, .com, .msi, .sh, .ps1) e limite de 20MB por arquivo.

### 📱 Download PWA

Página dedicada para instalação do aplicativo no celular via Progressive Web App, com banner automático de instalação, passo a passo visual com 3 etapas, cards de recursos (acesso rápido, offline, notificações, segurança) e design responsivo com bordas arredondadas.

### 🎬 Splash Screen

Tela de carregamento animada com logo em alta resolução (2048×2048px), barra de progresso com degradê azul→verde, efeito de bounce nos indicadores, círculos decorativos de fundo e transição suave de fade-out. Aparece apenas uma vez por sessão do navegador (controlado via `sessionStorage`).

---

## 🎨 Identidade Visual — Guia de Design

> **⚠️ Atenção aos detalhes visuais é um princípio fundamental deste projeto.** Toda interface deve respeitar rigorosamente a identidade visual oficial do DETRAN-RJ. Cards, menus, ícones e botões são deliberadamente coloridos — não genéricos — para reforçar a marca institucional em cada interação.

### Paleta de Cores Oficial

| Cor | Hex | Uso Principal |
|---|---|---|
| 🔵 **Azul DETRAN** | `#1A73C4` | Headers, links, elementos primários |
| 🔵 **Azul Escuro** | `#1B4F72` | Sidebar, textos de destaque, fundos escuros |
| 🟢 **Verde DETRAN** | `#1B8A5A` | Botões de ação, indicadores positivos |
| 🟢 **Verde Claro** | `#2ECC40` | Badges de status "vigente", ícones |
| ⚪ **Branco** | `#FFFFFF` | Fundos de cards, áreas de conteúdo |
| 🟡 **Dourado** | `#D4A017` | Alertas de "próximo vencimento" |
| 🔴 **Vermelho** | `#DC2626` | Alertas de "vencido", erros |

### Degradês Oficiais

```css
/* Header principal */
background: linear-gradient(135deg, #1B4F72, #1A73C4, #1B8A5A);

/* Cards KPI - Total */
background: linear-gradient(135deg, #1A73C4, #2196F3);

/* Cards KPI - Vigentes */
background: linear-gradient(135deg, #1B8A5A, #2ECC40);

/* Cards KPI - Próx. Vencimento */
background: linear-gradient(135deg, #D4A017, #F59E0B);

/* Cards KPI - Vencidos */
background: linear-gradient(135deg, #DC2626, #EF4444);

/* Ícones com degradê */
background: linear-gradient(135deg, #1A73C4, #1B8A5A);
```

### Princípios de Design

**Hierarquia visual** é estabelecida através do uso estratégico de azul para elementos informativos e de navegação, verde para ações positivas e confirmações, dourado para alertas de atenção, e vermelho para situações críticas. A tipografia utiliza a fonte do sistema (Inter/system-ui) com pesos variados: **bold** para títulos e números de destaque, **medium** para labels e navegação, **regular** para corpo de texto.

### Logo Oficial

A logo do DETRAN-RJ consiste na letra **"D"** dividida diagonalmente — a metade superior em **azul** e a inferior em **verde**, separadas por uma faixa branca diagonal. A logo foi recriada em **alta resolução (2048×2048px)** e está disponível nos seguintes formatos:

| Formato | Tamanho | Uso |
|---|---|---|
| Logo completa (D + texto) | 2048×2048 | Splash screen, documentos |
| Ícone D (sem texto) | 2048×2048 | Sidebar, favicon, PWA |
| PWA Icon | 512×512 | Ícone do app instalado |
| PWA Icon | 192×192 | Ícone do app (Android) |
| Favicon | 16/32/48px | Aba do navegador |
| Apple Touch Icon | 180×180 | iOS home screen |

---

## 🏗️ Arquitetura

O sistema segue uma arquitetura **monorepo fullstack** com tipagem end-to-end via tRPC. O frontend e o backend compartilham tipos TypeScript, eliminando contratos manuais de API.

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  React 19 + Tailwind 4 + shadcn/ui              │
│  ┌───────────┐  ┌───────────┐  ┌──────────┐    │
│  │  Pages    │  │Components │  │  Hooks   │    │
│  │  (views)  │──│  (UI)     │──│ (tRPC)   │    │
│  └───────────┘  └───────────┘  └────┬─────┘    │
│                                      │          │
│                              trpc.*.useQuery()  │
└──────────────────────────────────────┼──────────┘
                                       │ /api/trpc
┌──────────────────────────────────────┼──────────┐
│                   BACKEND            │          │
│  Express 4 + tRPC 11 + Drizzle ORM  │          │
│  ┌───────────┐  ┌───────────┐  ┌────┴─────┐   │
│  │  Routers  │──│   DB.ts   │──│  Schema  │   │
│  │(procedures│  │ (queries) │  │ (Drizzle)│   │
│  └───────────┘  └───────────┘  └────┬─────┘   │
│                                      │         │
│                              MySQL / TiDB      │
└──────────────────────────────────────┼─────────┘
                                       │
                              ┌────────┴────────┐
                              │  S3 Storage     │
                              │  (anexos)       │
                              └─────────────────┘
```

### Fluxo de Dados

O **frontend** chama procedures tRPC via hooks (`trpc.instrumentos.list.useQuery()`). O **tRPC** valida inputs com Zod e injeta o contexto de autenticação. O **router** delega para funções em `db.ts` que executam queries Drizzle. O **Drizzle ORM** traduz para SQL e executa no MySQL/TiDB. Os **resultados** fluem de volta com tipos preservados via SuperJSON.

---

## 📁 Estrutura de Pastas

```
detran-contratos/
├── 📄 README.md              ← Este arquivo
├── 📄 todo.md                ← Rastreamento de features e bugs
├── 📄 CHANGELOG.md           ← Histórico de versões
├── 📄 package.json           ← Dependências e scripts
├── 📄 tsconfig.json          ← Configuração TypeScript
├── 📄 vite.config.ts         ← Configuração Vite (build + dev)
├── 📄 vitest.config.ts       ← Configuração de testes
├── 📄 drizzle.config.ts      ← Configuração Drizzle Kit
├── 📄 components.json        ← Configuração shadcn/ui
│
├── 📂 client/                ← FRONTEND
│   ├── index.html            ← HTML base (meta tags PWA)
│   ├── public/               ← Arquivos estáticos (favicon, manifest, sw.js)
│   └── src/
│       ├── App.tsx           ← Rotas e layout principal + Splash Screen
│       ├── main.tsx          ← Entry point (providers tRPC + React Query)
│       ├── index.css         ← Tema global (CSS variables, cores DETRAN)
│       ├── pages/            ← Páginas do sistema
│       │   ├── Home.tsx              ← Dashboard com KPIs e gráficos
│       │   ├── Instrumentos.tsx      ← Listagem com filtros e exportação
│       │   ├── InstrumentoDetalhes.tsx ← Detalhes + barra de vigência
│       │   ├── InstrumentoForm.tsx   ← Formulário criar/editar
│       │   ├── Vpn.tsx              ← Listagem de conexões VPN
│       │   ├── VpnDetalhes.tsx      ← Detalhes da conexão VPN
│       │   ├── Download.tsx         ← Página de instalação PWA
│       │   └── NotFound.tsx         ← Página 404
│       ├── components/       ← Componentes reutilizáveis
│       │   ├── ui/           ← shadcn/ui (button, card, dialog...)
│       │   ├── DashboardLayout.tsx  ← Layout com sidebar DETRAN
│       │   ├── SplashScreen.tsx     ← Splash screen animada
│       │   └── AnexosModal.tsx      ← Modal de upload de anexos
│       ├── hooks/            ← Hooks customizados
│       │   ├── usePWAInstall.ts     ← Controle de instalação PWA
│       │   └── useMobile.tsx        ← Detecção de dispositivo móvel
│       ├── lib/              ← Utilitários
│       │   ├── trpc.ts              ← Cliente tRPC tipado
│       │   ├── export-utils.ts      ← Exportação CSV/Excel
│       │   └── utils-instrumentos.ts ← Helpers de status e formatação
│       └── contexts/         ← React contexts
│           └── ThemeContext.tsx      ← Provedor de tema (light/dark)
│
├── 📂 server/                ← BACKEND
│   ├── routers.ts            ← Procedures tRPC (API completa)
│   ├── db.ts                 ← Query helpers (Drizzle ORM)
│   ├── storage.ts            ← Helpers S3 (upload/download/delete)
│   ├── instrumentos.test.ts  ← 14 testes unitários
│   ├── auth.logout.test.ts   ← 1 teste de autenticação
│   └── _core/                ← Framework interno (NÃO EDITAR)
│
├── 📂 drizzle/               ← BANCO DE DADOS
│   ├── schema.ts             ← Definição de tabelas (5 tabelas)
│   ├── relations.ts          ← Relações entre tabelas
│   └── 0000-0003_*.sql       ← 4 migrações SQL aplicadas
│
├── 📂 shared/                ← COMPARTILHADO (frontend + backend)
│   ├── const.ts              ← Constantes globais (COOKIE_NAME, etc.)
│   └── types.ts              ← Tipos compartilhados
│
└── 📂 docs/                  ← DOCUMENTAÇÃO E SCRIPTS
    └── scripts/
        └── seed-db.mjs       ← Script de importação dos 57 instrumentos
```

> **Regra de ouro:** A raiz do projeto contém apenas arquivos de configuração essenciais. Scripts utilitários ficam em `docs/scripts/`. Assets estáticos ficam no CDN (nunca no repositório). Código morto é removido, não comentado.

---

## 🗄️ Banco de Dados

O banco de dados utiliza **MySQL (TiDB)** com **Drizzle ORM** para tipagem e migrações. Todas as tabelas do schema estão sincronizadas com o banco real.

### Diagrama de Tabelas

```
┌──────────────────┐     ┌──────────────────────┐
│      users       │     │    instrumentos       │
├──────────────────┤     ├──────────────────────┤
│ id (PK)          │     │ id (PK)              │
│ openId (UNIQUE)  │     │ numero               │
│ name             │     │ tipo                 │
│ email            │     │ partesEnvolvidas     │
│ loginMethod      │     │ objeto               │
│ role (enum)      │     │ dataInicio (bigint)  │
│ createdAt        │     │ dataTermino (bigint) │
│ updatedAt        │     │ processoSei          │
│ lastSignedIn     │     │ diretoria            │
└──────────────────┘     │ arquivoOrigem        │
                         │ createdAt            │
                         │ updatedAt            │
                         └──────────┬───────────┘
                                    │ 1:N
                         ┌──────────┴───────────┐
                         │   termos_aditivos     │
                         ├──────────────────────┤
                         │ id (PK)              │
                         │ instrumentoId (FK)   │
                         │ descricao            │
                         │ dataAditivo (bigint) │
                         │ createdAt            │
                         └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│    vpn_conexoes      │     │       anexos          │
├──────────────────────┤     ├──────────────────────┤
│ id (PK)              │     │ id (PK)              │
│ nomeUsuario          │     │ entidadeTipo (enum)  │
│ matricula            │     │ entidadeId           │
│ diretoria            │     │ nomeOriginal         │
│ servidor             │     │ nomeArquivo          │
│ ipAtribuido          │     │ mimeType             │
│ status (enum)        │     │ tamanho              │
│ ultimaConexao        │     │ s3Key                │
│ bytesEnviados        │     │ s3Url                │
│ bytesRecebidos       │     │ uploadedBy           │
│ createdAt            │     │ createdAt            │
│ updatedAt            │     └──────────────────────┘
└──────────────────────┘
```

### Dados Atuais

| Tabela | Registros | Observação |
|---|---|---|
| `instrumentos` | 57 | Importados de documentos SEI reais |
| `termos_aditivos` | 16 | Vinculados a instrumentos existentes |
| `users` | 2 | Usuários autenticados via OAuth |
| `vpn_conexoes` | 1 | Conexão de demonstração |
| `anexos` | 1 | Arquivo de teste |

### Índices de Performance

Foram criados índices otimizados para as consultas mais frequentes:

| Tabela | Índice | Colunas | Justificativa |
|---|---|---|---|
| `instrumentos` | `idx_instrumentos_diretoria` | `diretoria` | Filtro por diretoria no dashboard e listagem |
| `instrumentos` | `idx_instrumentos_tipo` | `tipo` | Filtro por tipo de instrumento |
| `termos_aditivos` | `idx_termos_instrumentoId` | `instrumentoId` | Join com instrumento pai |
| `anexos` | `idx_anexos_entidade` | `entidadeTipo, entidadeId` | Busca de anexos por entidade |
| `vpn_conexoes` | `idx_vpn_status` | `status` | Filtro por status de conexão |

### Convenções de Timestamps

Todas as datas de negócio (`dataInicio`, `dataTermino`, `dataAditivo`, `ultimaConexao`) são armazenadas como **Unix timestamps em milissegundos** (bigint). Timestamps de auditoria (`createdAt`, `updatedAt`) usam o tipo `timestamp` nativo do MySQL com `defaultNow()`. No frontend, timestamps são convertidos para o fuso horário local do usuário via `new Date(timestamp).toLocaleDateString("pt-BR")`.

### Diretorias Cadastradas

Os instrumentos estão organizados pelas seguintes diretorias:

| Diretoria | Instrumentos | Observação |
|---|---|---|
| Diretoria de Identificação Civil | 39 | Maior volume |
| Diretoria de Apoio Operacional | 5 | — |
| Externo | 4 | ERGE-RJ, SEPOL, MPRJ, OAB, TCE-RJ |
| Diretoria de Registro de Veículos | 4 | — |
| Diretoria de Administração e Finanças | 3 | — |
| Diretoria de Habilitação | 2 | — |

---

## 📱 Instalação PWA

O sistema é um **Progressive Web App** completo, instalável em dispositivos Android e iOS.

### Arquivos de Configuração

| Arquivo | Descrição |
|---|---|
| `client/public/manifest.json` | Metadados do app (nome, ícones, cores, orientação) |
| `client/public/sw.js` | Service Worker para cache e funcionamento offline |
| `client/index.html` | Meta tags PWA (theme-color, apple-mobile-web-app) |
| `client/src/hooks/usePWAInstall.ts` | Hook React para controlar o prompt de instalação |
| `client/src/pages/Download.tsx` | Página de download com banner automático |
| `client/src/components/SplashScreen.tsx` | Splash screen animada ao abrir o app |

### Como Instalar

1. Acesse o sistema pelo navegador Chrome no celular
2. Navegue até a página **Download** na sidebar
3. Toque em **"Instalar Agora"**
4. Confirme a instalação no banner do navegador
5. O app aparecerá na tela inicial com o ícone do DETRAN-RJ

---

## 🧪 Testes

O projeto utiliza **Vitest** para testes unitários, com foco nas procedures tRPC (camada de API).

### Cobertura Atual

| Arquivo | Testes | Cobertura |
|---|---|---|
| `server/instrumentos.test.ts` | 14 testes | Instrumentos CRUD, stats, alertas, termos, VPN |
| `server/auth.logout.test.ts` | 1 teste | Logout e limpeza de cookie |
| **Total** | **15 testes** | **Todas as procedures principais** |

### Executar Testes

```bash
# Executar todos os testes
pnpm test

# Executar em modo watch
pnpm test -- --watch

# Executar com cobertura
pnpm test -- --coverage
```

### Estratégia de Testes

Os testes utilizam **mocks** para a camada de banco de dados (`vi.mock("./db")`), testando isoladamente a lógica das procedures tRPC. Cada teste verifica a validação de input (Zod), a autenticação (public vs protected), e o retorno correto dos dados. Nenhuma feature é considerada "pronta" sem testes correspondentes.

---

## 🔄 Versionamento e GitHub

### Importância do Versionamento

O versionamento com Git e GitHub é **essencial** para projetos institucionais como os do DETRAN-RJ. Ele garante rastreabilidade completa de todas as alterações, possibilidade de reverter mudanças problemáticas, colaboração segura entre múltiplos desenvolvedores, e auditoria de quem alterou o quê e quando.

### Convenções de Commit

Recomenda-se o uso de **Conventional Commits** para manter o histórico organizado:

```
feat: adicionar filtro por status de vigência na listagem
fix: corrigir cálculo de prazo médio no dashboard
docs: atualizar README com guia de identidade visual
style: aplicar degradê azul-verde no header de instrumentos
refactor: extrair lógica de exportação para utils
test: adicionar testes para procedures de VPN
chore: atualizar dependências do projeto
```

### Fluxo de Trabalho Recomendado

1. **Desenvolver** a feature em branch separada (`feat/nome-da-feature`)
2. **Testar** localmente com `pnpm test`
3. **Commitar** com mensagem descritiva seguindo Conventional Commits
4. **Criar Pull Request** para revisão de código
5. **Merge** após aprovação da equipe
6. **Criar checkpoint** para deploy via plataforma Manus
7. **Publicar** clicando no botão Publish na interface

---

## 📐 Melhores Práticas para Projetos DETRAN-RJ

> Este documento serve como referência para **qualquer futuro projeto** do DETRAN-RJ, estabelecendo padrões de qualidade e consistência que devem ser adotados como princípios.

### 1. 🎨 Identidade Visual é Inegociável

Cada tela, card, botão e ícone deve carregar as cores oficiais do DETRAN-RJ. Não utilizar cores genéricas ou paletas padrão de frameworks. A paleta azul/verde/branco com degradês é a assinatura visual da instituição. Consultar sempre a seção [Identidade Visual](#-identidade-visual--guia-de-design) deste documento.

### 2. 🔍 Atenção aos Detalhes

Bordas arredondadas consistentes, espaçamento uniforme, hierarquia tipográfica clara (tamanhos, pesos, cores), estados de loading com skeletons, estados vazios com mensagens orientativas, e micro-interações que tornam a experiência fluida. Cada pixel conta.

### 3. 📝 Documentação Atualizada

A documentação deve ser atualizada **junto com o código**, não depois. O README deve refletir o estado atual do projeto. O CHANGELOG deve registrar cada versão. O `todo.md` deve rastrear features pendentes e concluídas. Documentação desatualizada é pior que nenhuma documentação.

### 4. 🧪 Testes como Requisito

Nenhuma feature é considerada "pronta" sem testes. Testes unitários para procedures, testes de integração para fluxos críticos. O comando `pnpm test` deve passar antes de qualquer merge ou deploy.

### 5. 🧹 Estrutura Limpa

A raiz do projeto contém apenas arquivos de configuração essenciais. Scripts utilitários ficam em `docs/scripts/`. Assets estáticos ficam no CDN (nunca no repositório). Código morto é **removido**, não comentado. Arquivos temporários e backups não devem existir no repositório.

### 6. 🔗 Tipagem End-to-End

TypeScript em 100% do código. tRPC para tipagem automática entre frontend e backend. Zod para validação de inputs. Drizzle para tipagem do banco de dados. Evitar `any` — cada tipo é um contrato de confiança entre as camadas.

### 7. ⚡ Performance e Acessibilidade

Índices no banco de dados para queries frequentes. Paginação em listagens. Lazy loading quando aplicável. Foco visível em todos os elementos interativos. Contraste adequado entre texto e fundo. Responsividade para dispositivos móveis.

### 8. 🔄 Versionamento Rigoroso

Cada alteração significativa deve ser commitada com mensagem descritiva. Branches para features, hotfixes e releases. Code review obrigatório. Tags para versões de produção. Nunca commitar diretamente na main.

---

## 🗺️ Roadmap

| Prioridade | Feature | Status |
|---|---|---|
| ✅ | Dashboard com KPIs e gráficos interativos | Concluído |
| ✅ | CRUD completo de instrumentos jurídicos | Concluído |
| ✅ | Termos aditivos vinculados a instrumentos | Concluído |
| ✅ | Gestão de conexões VPN | Concluído |
| ✅ | Sistema de anexos com S3 | Concluído |
| ✅ | Exportação CSV/Excel | Concluído |
| ✅ | Identidade visual oficial DETRAN-RJ | Concluído |
| ✅ | PWA com splash screen animada | Concluído |
| ✅ | Logo em alta resolução (2048×2048px) | Concluído |
| ✅ | Favicon e ícones PWA otimizados | Concluído |
| 🔲 | Notificações de vencimento por e-mail | Planejado |
| 🔲 | Relatórios em PDF com identidade visual | Planejado |
| 🔲 | Modo escuro com paleta DETRAN | Planejado |
| 🔲 | Onboarding para novos usuários | Planejado |
| 🔲 | Push notifications no PWA | Planejado |
| 🔲 | Importação de instrumentos via upload PDF | Planejado |
| 🔲 | Histórico de alterações (audit log) | Planejado |

---

## 📄 Licença

Projeto interno do **DETRAN-RJ** — Departamento de Trânsito do Estado do Rio de Janeiro.

Desenvolvido com ❤️ utilizando as melhores práticas de engenharia de software moderna.
