# SalesControl Pro

Sistema gamificado de gestão de vendas com interface moderna e responsiva.

## 🚀 Recursos

- **Gestão de Atendentes**: Cadastro, edição e controle de performance
- **Registro de Vendas**: Captura de dados completos do cliente
- **Sistema de Metas**: Definição e acompanhamento de objetivos
- **Ranking e Conquistas**: Gamificação para motivar a equipe
- **Painel Administrativo**: Controle completo do sistema
- **Notificações em Tempo Real**: Atualizações instantâneas
- **Design Responsivo**: Interface adaptável a qualquer dispositivo

## 🛠️ Tecnologias

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **UI**: Tailwind CSS + shadcn/ui
- **Estado**: TanStack Query (React Query)
- **Validação**: Zod

## 🏃 Execução

```bash
# Instalar dependências
npm install

# Configurar banco de dados
npm run db:push

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

## 🎯 Funcionalidades

### Registro de Vendas
- Seleção de atendente
- Valores e comissões automáticas
- Dados completos do cliente (nome, telefone, email, endereço)

### Gestão de Atendentes
- Upload de fotos
- Controle de ganhos
- Histórico de vendas
- Estatísticas de performance

### Sistema de Metas
- Criação de metas individuais
- Acompanhamento de progresso
- Notificações de conquistas

### Painel Administrativo
- Login seguro (admin/root123)
- Controle total do sistema
- Configurações personalizáveis
- Relatórios e exportações

## 📊 Estrutura do Projeto

```
├── client/          # Frontend React
│   ├── src/
│   │   ├── components/   # Componentes UI
│   │   ├── pages/       # Páginas da aplicação
│   │   ├── lib/         # Utilitários
│   │   └── hooks/       # Hooks personalizados
├── server/          # Backend Express
│   ├── routes.ts    # Rotas da API
│   ├── storage.ts   # Interface de dados
│   └── db.ts        # Configuração do banco
├── shared/          # Tipos compartilhados
│   └── schema.ts    # Schemas Drizzle + Zod
└── package.json     # Dependências
```

## 🔧 Configuração

### Variáveis de Ambiente
```bash
DATABASE_URL=postgresql://user:pass@host:port/db
```

### Banco de Dados
O sistema utiliza PostgreSQL com Drizzle ORM. As tabelas são criadas automaticamente.

### Credenciais Padrão
- **Admin**: administrador / root123

## 📱 Responsividade

Sistema completamente responsivo com suporte a:
- Smartphones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Telas ultrawide (1920px+)

## 🎨 Design

Interface moderna com:
- Tema escuro profissional
- Animações suaves
- Feedback visual
- Tipografia otimizada
- Cores acessíveis

## 🔒 Segurança

- Senhas criptografadas (bcrypt)
- Validação de dados (Zod)
- Sanitização de inputs
- Headers de segurança

## 📈 Performance

- Bundle otimizado (556KB)
- Lazy loading
- Cache inteligente
- Polling otimizado (30s)

## 🚀 Deploy

Sistema pronto para deploy em plataformas como:
- Vercel
- Netlify
- Railway
- Heroku

Documentação completa de deploy disponível nos arquivos de configuração.