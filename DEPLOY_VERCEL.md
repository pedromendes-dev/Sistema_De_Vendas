# Deploy para Vercel - Sistema de Gestão de Vendas

## Pré-requisitos

1. Conta no Vercel (https://vercel.com)
2. Conta no GitHub (para conectar o repositório)
3. Banco de dados PostgreSQL (Neon Database recomendado)

## Passos para Deploy

### 1. Preparar o Repositório

1. Crie um repositório no GitHub
2. Faça upload de todos os arquivos do projeto
3. Certifique-se de que o arquivo `vercel.json` está incluído

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, adicione estas variáveis:

```
DATABASE_URL=sua_url_do_banco_postgresql
PGHOST=seu_host_do_banco
PGPORT=5432
PGUSER=seu_usuario
PGPASSWORD=sua_senha
PGDATABASE=seu_banco
NODE_ENV=production
```

### 3. Deploy no Vercel

1. Acesse https://vercel.com/dashboard
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente
5. Clique em "Deploy"

### 4. Configurações Adicionais

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Functions:**
- Runtime: Node.js 18.x
- Region: Washington, D.C. (iad1) - mais próximo do Brasil

### 5. Domínio Personalizado (Opcional)

1. No dashboard do Vercel, vá para "Settings" > "Domains"
2. Adicione seu domínio personalizado
3. Configure os DNS conforme instruído

## Estrutura dos Arquivos

```
projeto/
├── server/           # Backend Express
├── client/           # Frontend React
├── shared/           # Schemas compartilhados
├── vercel.json       # Configuração do Vercel
├── package.json      # Dependências
├── vite.config.ts    # Configuração do Vite
└── tailwind.config.ts # Configuração do Tailwind
```

## Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar localmente
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start

# Atualizar banco de dados
npm run db:push
```

## Resolução de Problemas

### Build Falha
- Verifique se todas as dependências estão no package.json
- Certifique-se de que não há erros de TypeScript

### Banco de Dados
- Verifique se a URL do banco está correta
- Execute `npm run db:push` para criar as tabelas

### Variáveis de Ambiente
- Todas as variáveis devem estar configuradas no Vercel
- Reinicie o deployment após adicionar novas variáveis

## Funcionalidades do Sistema

- ✅ Sistema de login para administradores
- ✅ Gestão completa de atendentes
- ✅ Controle de vendas em tempo real
- ✅ Sistema de metas e conquistas
- ✅ Ranking de performance
- ✅ Notificações automáticas
- ✅ Relatórios e exportações
- ✅ Interface responsiva
- ✅ Integração WhatsApp
- ✅ Dashboard avançado

## Suporte

Para dúvidas sobre o deploy ou funcionamento do sistema, verifique:
1. Logs do Vercel
2. Console do navegador
3. Variáveis de ambiente
4. Conexão com banco de dados

---

**Credenciais de Administrador:**
- Usuário: `administrador`
- Senha: `root123`

**Importante:** Altere as credenciais após o primeiro acesso!