<p align="center">
  <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-icon-hq-TdvfPVr3p8pZjaYvubcmtk.png" alt="DETRAN-RJ Logo" width="120" />
</p>

<h1 align="center">🏛️ DETRAN-RJ — Sistema de Gestão de Instrumentos</h1>

<p align="center">
  <strong>Plataforma web completa para gestão de contratos, convênios, termos de cooperação e conexões VPN do Departamento de Trânsito do Estado do Rio de Janeiro.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Versão-1.5.0-1B4F72?style=for-the-badge" alt="Versão 1.5.0" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/tRPC-11-2596BE?style=for-the-badge&logo=trpc&logoColor=white" alt="tRPC 11" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-MySQL-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PWA-Instalável-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Vitest-15_testes-6E9F18?style=for-the-badge&logo=vitest&logoColor=white" alt="Vitest" />
</p>

<p align="center">
  🌐 <a href="https://detranmgmt-mdxpdwkk.manus.space"><strong>detranmgmt-mdxpdwkk.manus.space</strong></a> &nbsp;|&nbsp;
  🌐 <a href="https://detran-vpn.manus.space"><strong>detran-vpn.manus.space</strong></a> &nbsp;|&nbsp;
  📦 <a href="https://github.com/arquimedesmsc-crypto/detran-contratos"><strong>GitHub</strong></a>
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
9. [Skill Reutilizável — Design System](#-skill-reutilizável--design-system)
10. [Versionamento e GitHub](#-versionamento-e-github)
11. [Melhores Práticas para Projetos DETRAN-RJ](#-melhores-práticas-para-projetos-detran-rj)
12. [Roadmap](#-roadmap)

---

## 🎯 Visão Geral

O **Sistema de Gestão de Instrumentos do DETRAN-RJ** é uma aplicação web moderna que centraliza o controle de todos os instrumentos jurídicos (contratos, convênios, termos de cooperação, acordos) e conexões VPN do Departamento de Trânsito do Estado do Rio de Janeiro.

O sistema oferece **dashboard interativo** com indicadores em tempo real, **alertas de vencimento**, **exportação de dados**, **gestão de anexos via S3** e **instalação como aplicativo** no celular via PWA. A base de dados inicial foi populada com **57 instrumentos reais** extraídos de documentos SEI, abrangendo contratos, convênios, acordos de cooperação técnica e termos de cooperação de diversas diretorias.

| Característica | Detalhe |
|---|---|
| **Stack Frontend** | React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui |
| **Stack Backend** | Express 4 + tRPC 11 + Drizzle ORM + MySQL/TiDB |
| **Autenticação** | Manus OAuth com sessão via cookie JWT |
| **Armazenamento** | S3 para anexos, MySQL para dados estruturados |
| **PWA** | Service Worker + Manifest + Splash Screen animada |
| **Testes** | Vitest com 15 testes unitários cobrindo todas as procedures |
| **Domínios** | `detranmgmt-mdxpdwkk.manus.space` e `detran-vpn.manus.space` |
| **Repositório** | [github.com/arquimedesmsc-crypto/detran-contratos](https://github.com/arquimedesmsc-crypto/detran-contratos) |
| **Skill** | `detran-design-system` — Design System reutilizável para futuros projetos |

---

## ✨ Funcionalidades

### 📊 Dashboard

O painel principal exibe uma visão consolidada de todos os instrumentos jurídicos com **cards KPI coloridos** (total em azul, vigentes em verde, próximos do vencimento em dourado, vencidos em vermelho), gráficos interativos por diretoria e status de vigência, e indicadores de prazo médio. Cada card utiliza degradê nas cores oficiais do DETRAN-RJ para reforçar a identidade visual. Os ícones possuem fundo semi-transparente branco sobre degradê, criando profundidade e elegância.

### 📄 Gestão de Instrumentos

Módulo completo de CRUD para instrumentos jurídicos com listagem paginada, filtros avançados (diretoria, tipo, status de vigência, período), ordenação por qualquer coluna, busca textual, exportação para CSV/Excel e visualização detalhada com barra de vigência visual. Os indicadores de status utilizam cores semânticas: **verde** para vigente, **dourado** para próximo do vencimento (< 180 dias), e **vermelho** para vencido. O header da tabela usa degradê sutil `#F8FAFC → #F0F9FF` com texto em azul escuro `#1B4F72`.

### 📝 Termos Aditivos

Cada instrumento pode ter múltiplos termos aditivos vinculados, com data e descrição, exibidos em timeline cronológica na página de detalhes. A criação e exclusão de termos é protegida por autenticação. O ícone do card de termos usa degradê azul→verde para manter consistência visual.

### 🔒 Gestão de VPN

Módulo para controle de conexões VPN com status em tempo real (conectado, desconectado, bloqueado), estatísticas de tráfego (bytes enviados/recebidos), filtros por diretoria e status, e página de detalhes por conexão. Badges de status coloridos: verde para conectado, vermelho para desconectado, dourado para bloqueado.

### 📎 Anexos

Sistema de upload de arquivos vinculados a instrumentos ou conexões VPN, com armazenamento em S3, validação de tipos permitidos (bloqueia `.exe`, `.bat`, `.cmd`, `.com`, `.msi`, `.sh`, `.ps1`) e limite de 20MB por arquivo.

### 📱 Download PWA

Página dedicada para instalação do aplicativo no celular via Progressive Web App, com banner automático de instalação, passo a passo visual com 3 etapas, cards de recursos (acesso rápido, offline, notificações, segurança) e design responsivo com bordas arredondadas e degradês DETRAN.

### 🎬 Splash Screen

Tela de carregamento animada com logo em alta resolução (2048×2048px), barra de progresso com degradê azul→verde, efeito de bounce nos indicadores, círculos decorativos de fundo com `radial-gradient` suave e transição de fade-out de 500ms. Aparece apenas uma vez por sessão do navegador (controlado via `sessionStorage`).

---

## 🎨 Identidade Visual — Guia de Design

> **⚠️ Atenção aos detalhes visuais é um princípio fundamental deste projeto.** Toda interface deve respeitar rigorosamente a identidade visual oficial do DETRAN-RJ. Cards, menus, ícones e botões são deliberadamente coloridos — não genéricos — para reforçar a marca institucional em cada interação. A paleta é vibrante e predominantemente azul/verde/branco, mas permite cores complementares (dourado, vermelho) para semântica.

### 🎨 Paleta de Cores Oficial

| Cor | Hex | OKLCH | Uso Principal |
|---|---|---|---|
| 🔵 **Azul DETRAN** | `#1A73C4` | `oklch(0.52 0.16 250)` | Headers, links, elementos primários |
| 🔵 **Azul Escuro** | `#1B4F72` | `oklch(0.35 0.10 250)` | Sidebar, textos de destaque, fundos escuros |
| 🟢 **Verde DETRAN** | `#1B8A5A` | `oklch(0.55 0.16 155)` | Botões de ação, indicadores positivos |
| 🟢 **Verde Escuro** | `#1E6B3A` | `oklch(0.42 0.12 155)` | Variante escura do verde |
| ⚪ **Branco** | `#FFFFFF` | — | Fundos de cards, áreas de conteúdo |
| 🟡 **Dourado** | `#D4A017` / `#F59E0B` | — | Alertas de "próximo vencimento" |
| 🔴 **Vermelho** | `#DC2626` / `#EF4444` | — | Alertas de "vencido", erros |
| 🔵 **Azul Claro** | `#E8F4FD` | — | Fundo suave azul |
| 🟢 **Verde Claro** | `#E8F5E9` | — | Fundo suave verde |
| ⚫ **Fundo App** | `#F9FAFB` | — | Fundo principal da aplicação |

### 🌈 Degradês Oficiais

```css
/* Header principal de cada página */
background: linear-gradient(135deg, #1B4F72, #1A73C4, #1B8A5A);

/* Ícones circulares com degradê */
background: linear-gradient(135deg, #1A73C4, #1B8A5A);

/* Cards KPI - Total (azul) */
background: linear-gradient(135deg, #1A73C4, #2196F3);

/* Cards KPI - Vigentes (verde) */
background: linear-gradient(135deg, #1B8A5A, #4CAF50);

/* Cards KPI - Próx. Vencimento (dourado) */
background: linear-gradient(135deg, #F59E0B, #FBBF24);

/* Cards KPI - Vencidos (vermelho) */
background: linear-gradient(135deg, #DC2626, #EF4444);

/* Barra de progresso (horizontal) */
background: linear-gradient(90deg, #1A73C4, #1B8A5A);

/* Fundo sutil de seção */
background: linear-gradient(135deg, #E8F4FD, #E8F5E9);

/* Botão primário (verde) */
background: linear-gradient(135deg, #1B8A5A, #2E9D6A);
```

### ✏️ Tipografia

A fonte oficial é **Roboto** (Google Fonts) com pesos 400, 500, 700 e 900. A hierarquia visual é estabelecida através do uso estratégico de cores: **azul escuro** (`#1B4F72`) para títulos e seções, **verde** (`#1B8A5A`) para ações e confirmações, **dourado** (`#D4A017`) para alertas de atenção, e **vermelho** (`#DC2626`) para situações críticas.

| Elemento | Peso | Tamanho | Cor |
|---|---|---|---|
| Título de página (h1) | 700 (bold) | 24–28px | Branco (sobre degradê) |
| Subtítulo de página | 400 | 14px | Branco/70% |
| Título de seção (h2) | 700 | 18–20px | `#1B4F72` (azul escuro) |
| Número KPI | 700 | 32–40px | Branco (sobre card colorido) |
| Label KPI | 400 | 12–13px | Branco/80% |
| Corpo de texto | 400 | 14px | `#374151` (gray-700) |
| Label de campo | 500 | 13px | `#6B7280` (gray-500) |
| Texto muted | 400 | 12px | `#9CA3AF` (gray-400) |

### 🖼️ Logo Oficial

A logo do DETRAN-RJ consiste na letra **"D"** dividida diagonalmente — a metade superior em **azul** e a inferior em **verde**, separadas por uma faixa branca diagonal. A logo foi recriada em **alta resolução (2048×2048px)** e está disponível nos seguintes formatos:

| Formato | Tamanho | Uso | URL CDN |
|---|---|---|---|
| Ícone D (HQ) | 2048×2048 | Sidebar, splash | [CDN Link](https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-icon-hq-TdvfPVr3p8pZjaYvubcmtk.png) |
| Logo completa | Original | Documentos, login | [CDN Link](https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-logo-full_ee24eb7a.jpg) |
| PWA Icon 512 | 512×512 | App instalado | [CDN Link](https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-pwa-icon-512-cxqJqFcxRkGYQqFbNhHXLV.png) |
| PWA Icon 192 | 192×192 | Android | [CDN Link](https://d2xsxph8kpxj0f.cloudfront.net/310519663443081896/MDXpDWKkLJQQcpGvzWTLe8/detran-pwa-icon-192-PjPYZnfYEjMRKoHJJqmPCr.png) |
| Favicon | 16/32/48px | Aba do navegador | `client/public/favicon.ico` |

### 🧩 Padrões de Componentes

**Header de página**: degradê 135deg `#1B4F72 → #1A73C4 → #1B8A5A`, texto branco, `rounded-xl p-6`, ícone à esquerda.

**Cards KPI**: degradê colorido por tipo, `rounded-xl shadow-lg`, ícone com fundo `rgba(255,255,255,0.2)`, número grande bold, label uppercase tracking-wider.

**Sidebar**: fundo `oklch(0.22 0.05 250)`, item ativo com `border-left: 3px solid #1B8A5A` e fundo degradê semi-transparente. Logo D no header. Avatar com degradê azul→verde no footer.

**Tabelas**: header com degradê sutil `#F8FAFC → #F0F9FF`, texto `#1B4F72`. Badges de status coloridos. Hover suave nas linhas.

**Botões**: primário = degradê verde `#1B8A5A → #2E9D6A`, texto branco, `rounded-lg`. Secundário = outline com borda azul.

**Splash Screen**: fundo branco, logo com `borderRadius: 28px` e sombra azul, título com `background-clip: text` degradê, barra de progresso azul→verde, 3 dots bounce, fade-out 500ms.

**Bordas e Espaçamento**: `rounded-xl` (12px) para cards, `rounded-lg` (8px) para botões, `shadow-lg` para cards elevados, `p-5` ou `p-6` para padding interno, `gap-4` ou `gap-6` entre cards.

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

O **frontend** chama procedures tRPC via hooks (`trpc.instrumentos.list.useQuery()`). O **tRPC** valida inputs com Zod e injeta o contexto de autenticação. O **router** delega para funções em `db.ts` que executam queries Drizzle. O **Drizzle ORM** traduz para SQL e executa no MySQL/TiDB. Os **resultados** fluem de volta com tipos preservados via SuperJSON.

---

## 📁 Estrutura de Pastas

```
detran-contratos/
├── 📄 README.md              ← Este arquivo
├── 📄 todo.md                ← Rastreamento de features e bugs
├── 📄 CHANGELOG.md           ← Histórico de versões (Keep a Changelog)
├── 📄 package.json           ← Dependências e scripts
├── 📄 tsconfig.json          ← Configuração TypeScript
├── 📄 vite.config.ts         ← Configuração Vite (build + dev)
├── 📄 vitest.config.ts       ← Configuração de testes
├── 📄 drizzle.config.ts      ← Configuração Drizzle Kit
├── 📄 components.json        ← Configuração shadcn/ui
│
├── 📂 client/                ← FRONTEND
│   ├── index.html            ← HTML base (meta tags PWA, Google Fonts Roboto)
│   ├── public/               ← Arquivos estáticos (favicon, manifest, sw.js)
│   └── src/
│       ├── App.tsx           ← Rotas, layout principal + Splash Screen
│       ├── main.tsx          ← Entry point (providers tRPC + React Query)
│       ├── index.css         ← 🎨 Tema global (CSS variables OKLCH, degradês, utilities DETRAN)
│       ├── pages/
│       │   ├── Home.tsx              ← Dashboard com KPIs e gráficos
│       │   ├── Instrumentos.tsx      ← Listagem com filtros e exportação
│       │   ├── InstrumentoDetalhes.tsx ← Detalhes + barra de vigência
│       │   ├── InstrumentoForm.tsx   ← Formulário criar/editar
│       │   ├── Vpn.tsx              ← Listagem de conexões VPN
│       │   ├── VpnDetalhes.tsx      ← Detalhes de conexão VPN
│       │   ├── Download.tsx         ← Página de instalação PWA
│       │   └── NotFound.tsx         ← Página 404
│       ├── components/
│       │   ├── ui/                  ← shadcn/ui (button, card, dialog, table...)
│       │   ├── DashboardLayout.tsx  ← Layout com sidebar DETRAN (logo, cores, menu)
│       │   ├── SplashScreen.tsx     ← Splash screen animada (logo, progresso, fade)
│       │   └── AnexosModal.tsx      ← Modal de upload de anexos S3
│       ├── hooks/
│       │   ├── usePWAInstall.ts     ← Controle de instalação PWA
│       │   └── useMobile.tsx        ← Detecção de dispositivo móvel
│       ├── lib/
│       │   ├── trpc.ts              ← Cliente tRPC tipado
│       │   ├── export-utils.ts      ← Exportação CSV/Excel
│       │   └── utils-instrumentos.ts ← Helpers de status e formatação
│       └── contexts/
│           └── ThemeContext.tsx      ← Provedor de tema (light/dark)
│
├── 📂 server/                ← BACKEND
│   ├── routers.ts            ← Procedures tRPC (API completa)
│   ├── db.ts                 ← Query helpers (Drizzle ORM)
│   ├── storage.ts            ← Helpers S3 (upload/download)
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
│   ├── const.ts              ← Constantes globais
│   └── types.ts              ← Tipos compartilhados
│
└── 📂 docs/                  ← DOCUMENTAÇÃO E SCRIPTS
    └── scripts/
        └── seed-db.mjs       ← Script de importação dos 57 instrumentos SEI
```

> **Regra de ouro:** A raiz do projeto contém apenas arquivos de configuração essenciais. Scripts utilitários ficam em `docs/scripts/`. Assets estáticos ficam no CDN (nunca no repositório). Código morto é removido, não comentado.

---

## 🗄️ Banco de Dados

O banco de dados utiliza **MySQL (TiDB)** com **Drizzle ORM** para tipagem e migrações. Todas as tabelas do schema (`drizzle/schema.ts`) estão 100% sincronizadas com o banco real.

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

| Diretoria | Instrumentos |
|---|---|
| Diretoria de Identificação Civil | 39 |
| Diretoria de Apoio Operacional | 5 |
| Externo (ERGE-RJ, SEPOL, MPRJ, OAB, TCE-RJ) | 4 |
| Diretoria de Registro de Veículos | 4 |
| Diretoria de Administração e Finanças | 3 |
| Diretoria de Habilitação | 2 |

---

## 📱 Instalação PWA

O sistema é um **Progressive Web App** completo, instalável em dispositivos Android e iOS.

### Arquivos de Configuração

| Arquivo | Descrição |
|---|---|
| `client/public/manifest.json` | Metadados do app (nome, ícones, cores, orientação) |
| `client/public/sw.js` | Service Worker para cache e funcionamento offline |
| `client/index.html` | Meta tags PWA (theme-color, apple-mobile-web-app, Roboto) |
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

## 🧩 Skill Reutilizável — Design System

Foi criada a skill **`detran-design-system`** para garantir que futuros projetos do DETRAN-RJ (Patrimônio, Wiki, Assistente SEI, etc.) partam da mesma base visual e técnica. A skill é compatível com **Manus** e **Claude Code**.

### Conteúdo da Skill

| Arquivo | Descrição |
|---|---|
| `SKILL.md` | Documento principal com paleta, tipografia, componentes, workflow de novo projeto |
| `references/design-system.md` | Design System completo: degradês, animações, responsividade, espaçamento |
| `references/coding-standards.md` | Padrões de backend (tRPC, Drizzle, testes), frontend (React, Tailwind, shadcn), convenções |
| `references/claude-code-instructions.md` | Template `CLAUDE.md` para raiz do projeto, checklist de novo projeto, logos CDN |
| `templates/index.css` | Arquivo CSS completo com tema DETRAN (CSS variables OKLCH, degradês, utilities) |

### Como Usar

**No Manus:** A skill é carregada automaticamente ao criar projetos para o DETRAN-RJ. Basta referenciar `detran-design-system` e seguir o workflow descrito no `SKILL.md`.

**No Claude Code:** Copiar o conteúdo de `references/claude-code-instructions.md` para um arquivo `CLAUDE.md` na raiz do novo projeto. Copiar `templates/index.css` para `client/src/index.css`. O Claude Code seguirá automaticamente os padrões definidos.

### Workflow de Novo Projeto

1. Inicializar projeto com template `web-db-user`
2. Copiar `templates/index.css` para `client/src/index.css`
3. Adicionar Roboto no `index.html`
4. Configurar schema do banco em `drizzle/schema.ts`
5. Criar DashboardLayout com sidebar escura e logo D
6. Criar SplashScreen animada
7. Implementar páginas: header degradê → cards KPI → conteúdo
8. Configurar PWA com cores DETRAN
9. Escrever testes em `server/*.test.ts`
10. Documentar: README.md, CHANGELOG.md, todo.md

---

## 🔄 Versionamento e GitHub

### Importância do Versionamento

O versionamento com Git e GitHub é **essencial** para projetos institucionais como os do DETRAN-RJ. Ele garante rastreabilidade completa de todas as alterações, possibilidade de reverter mudanças problemáticas, colaboração segura entre múltiplos desenvolvedores, e auditoria de quem alterou o quê e quando.

### Repositório

| Item | Valor |
|---|---|
| **URL** | [github.com/arquimedesmsc-crypto/detran-contratos](https://github.com/arquimedesmsc-crypto/detran-contratos) |
| **Branch principal** | `main` |
| **Remote Manus** | `origin` (S3 interno) |
| **Remote GitHub** | `user_github` |
| **Sincronização** | Automática via `webdev_save_checkpoint` |

### Convenções de Commit

O projeto utiliza **Conventional Commits** para manter o histórico organizado:

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

Cada tela, card, botão e ícone deve carregar as cores oficiais do DETRAN-RJ. Não utilizar cores genéricas ou paletas padrão de frameworks. A paleta azul/verde/branco com degradês é a assinatura visual da instituição. Consultar sempre a seção [Identidade Visual](#-identidade-visual--guia-de-design) deste documento e a skill `detran-design-system`.

### 2. 🔍 Atenção aos Detalhes

Bordas arredondadas consistentes (`rounded-xl` para cards, `rounded-lg` para botões), espaçamento uniforme, hierarquia tipográfica clara (tamanhos, pesos, cores), estados de loading com skeletons, estados vazios com mensagens orientativas, e micro-interações que tornam a experiência fluida. Cada pixel conta.

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

### 9. 🧩 Reutilizar a Skill

Ao iniciar um novo projeto DETRAN-RJ, **sempre** carregar a skill `detran-design-system` antes de escrever qualquer código. Ela contém o tema CSS pronto, os padrões de componentes, as convenções de código e as instruções para Claude Code. Isso garante consistência entre todos os sistemas da instituição.

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
| ✅ | Skill `detran-design-system` reutilizável | Concluído |
| ✅ | Documentação completa (README, CHANGELOG, todo) | Concluído |
| ✅ | Auditoria e limpeza de estrutura | Concluído |
| ✅ | Índices de performance no banco | Concluído |
| ✅ | Publicação com domínios customizados | Concluído |
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

**Versão atual:** 1.5.0 — Março 2026
