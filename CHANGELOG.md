# 📋 Changelog — DETRAN-RJ Sistema de Gestão de Instrumentos

Todas as alterações relevantes deste projeto são documentadas neste arquivo, seguindo o formato [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.5.0] — 2026-03-26

### 📝 Documentação
- **README.md** completamente reescrito com todas as features atualizadas, domínios publicados (`detranmgmt-mdxpdwkk.manus.space` e `detran-vpn.manus.space`), seção da skill `detran-design-system`, badges com versão, paleta de cores com OKLCH, URLs CDN de todas as logos, e roadmap atualizado com 15 itens concluídos
- **CHANGELOG.md** atualizado com versão 1.5.0
- **todo.md** revisado e atualizado com 119 itens rastreados
- Repositório GitHub sincronizado com a versão mais recente

---

## [1.4.0] — 2026-03-17

### ✨ Adicionado
- **Skill `detran-design-system`** reutilizável para Manus e Claude Code, contendo Design System completo, Coding Standards e templates CSS
- **Referência de Design System** (`references/design-system.md`) com paleta, degradês, tipografia, componentes, animações e responsividade
- **Referência de Coding Standards** (`references/coding-standards.md`) com padrões de backend, frontend, testes e convenções
- **Instruções para Claude Code** (`references/claude-code-instructions.md`) com template CLAUDE.md e checklist de novo projeto
- **Template `index.css`** com tema DETRAN completo (CSS variables OKLCH, degradês, utilities) pronto para copiar em novos projetos

### 📝 Documentação
- CHANGELOG.md atualizado com versão 1.4.0
- todo.md atualizado com 115 itens rastreados (todos concluídos)

---

## [1.3.0] — 2026-03-17

### ✨ Adicionado
- **Splash Screen animada** com logo em alta resolução (2048×2048px), barra de progresso com degradê azul→verde, efeito bounce nos indicadores e fade-out suave
- **Logo DETRAN-RJ recriada** em alta resolução via geração de imagem AI, fiel ao original (D azul/verde com faixa branca diagonal)
- **Favicon.ico** gerado em múltiplos tamanhos (16/32/48px) a partir da nova logo
- **Ícones PWA** 192×192 e 512×512 com bordas arredondadas
- **Apple Touch Icon** 180×180 para iOS

### 📝 Documentação
- **README.md** completamente reescrito com guia de identidade visual, paleta de cores, degradês oficiais, diagrama de arquitetura, estrutura de pastas detalhada e melhores práticas
- **CHANGELOG.md** criado para rastreamento de versões
- **todo.md** atualizado com todas as features concluídas e pendentes

### 🧹 Manutenção
- Removidos arquivos obsoletos da raiz: `screenshot-notes.md`, `vite.config.ts.bak`
- Removidas páginas fantasma não utilizadas: `Alertas.tsx`, `ComponentShowcase.tsx`
- Script `seed-db.mjs` movido para `docs/scripts/`
- Criados 5 índices de performance no banco de dados
- Servidor reiniciado para resolver erro de cache do `storageDelete`

---

## [1.2.0] — 2026-03-17

### ✨ Adicionado
- **Página de Download PWA** com design responsivo, banner automático de instalação, passo a passo visual com 3 etapas e cards de recursos
- **Hook `usePWAInstall`** para controle programático da instalação PWA
- **manifest.json** configurado com ícones, cores e orientação do DETRAN-RJ
- **Service Worker** (`sw.js`) para cache e funcionamento offline
- **Meta tags PWA** no `index.html` (theme-color, apple-mobile-web-app)
- Item **"Download"** adicionado na sidebar lateral

---

## [1.1.0] — 2026-03-17

### 🎨 Identidade Visual
- **Tema CSS** refatorado com cores oficiais: Azul `#1A73C4`, Verde `#1B8A5A`, Azul Escuro `#1B4F72`
- **Degradê azul→verde** aplicado em todos os headers de página
- **Cards KPI** do Dashboard com degradês coloridos (azul, verde, dourado, vermelho)
- **Sidebar** com fundo escuro, logo oficial e borda verde no item ativo
- **Ícones** com degradê azul→verde em todas as seções
- **Botões de ação** com degradê verde
- **Tabelas** com header sutil em degradê
- **Logos DETRAN-RJ** carregadas no CDN (D azul/verde e texto completo)
- Identidade visual aplicada em todas as páginas: Dashboard, Instrumentos, Detalhes, Formulário, VPN e Detalhes VPN

---

## [1.0.0] — 2026-03-17

### ✨ Adicionado
- **Dashboard** com KPIs (total, vigentes, próx. vencimento, vencidos), gráficos por diretoria, tipo e status de vigência
- **CRUD de Instrumentos** com listagem paginada, filtros avançados, ordenação, busca textual e exportação CSV/Excel
- **Termos Aditivos** vinculados a instrumentos com timeline cronológica
- **Gestão de VPN** com listagem, filtros por status/diretoria, e página de detalhes
- **Sistema de Anexos** com upload para S3, validação de tipos e limite de 20MB
- **Autenticação** via Manus OAuth com sessão JWT
- **15 testes unitários** cobrindo todas as procedures tRPC
- **57 instrumentos reais** importados de documentos SEI
- **16 termos aditivos** vinculados a instrumentos existentes

### 🗄️ Banco de Dados
- Tabela `users` com roles (admin/user)
- Tabela `instrumentos` com campos completos de instrumentos jurídicos
- Tabela `termos_aditivos` com vínculo 1:N para instrumentos
- Tabela `vpn_conexoes` com status, tráfego e dados de rede
- Tabela `anexos` polimórfica (instrumento/vpn) com referência S3
- 4 migrações SQL aplicadas via Drizzle Kit
