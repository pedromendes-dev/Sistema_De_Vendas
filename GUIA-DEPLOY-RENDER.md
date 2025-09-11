# Guia de Deploy no Render

Este guia explica como fazer o deploy do Sistema de Vendas no Render.

## Pré-requisitos

1. Conta no Render (https://render.com)
2. Repositório no GitHub com o código
3. Configuração do Supabase (se usando)

## Passo 1: Preparar o Repositório

O projeto já está configurado com:
- `render.yaml` - Configuração do serviço
- `Dockerfile` - Container para deploy
- Scripts otimizados no `package.json`

## Passo 2: Criar Serviços no Render

### 2.1 Criar Banco de Dados PostgreSQL

1. Acesse o painel do Render
2. Clique em "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `sistema-vendas-db`
   - **Database**: `sistemav`
   - **User**: `sistemav_user`
   - **Plan**: Starter (gratuito)
4. Clique em "Create Database"

### 2.2 Criar Serviço Web

1. No painel do Render, clique em "New +" → "Web Service"
2. Conecte seu repositório GitHub
3. Configure:
   - **Name**: `sistema-vendas`
   - **Environment**: `Node`
   - **Root Directory**: (deixe vazio)
   - **Build Command**: `pnpm run build:render`
   - **Start Command**: `pnpm run start:render`
   - **Plan**: Starter (gratuito)

## Passo 3: Configurar Variáveis de Ambiente

No painel do serviço web, vá para "Environment" e adicione:

### Configurações Básicas
```
NODE_ENV=production
PORT=10000
```

### Configurações do Supabase
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Configurações do Banco de Dados
O Render automaticamente fornece:
```
DATABASE_URL=postgresql://username:password@host:port/database
```

### Configurações de Segurança
```
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=10
```

## Passo 4: Configurar Banco de Dados

### 4.1 Conectar Banco ao Serviço Web

1. No painel do serviço web, vá para "Environment"
2. Clique em "Link Database"
3. Selecione o banco `sistema-vendas-db` criado anteriormente
4. O Render automaticamente adicionará a variável `DATABASE_URL`

### 4.2 Executar Migrações

Após o primeiro deploy, execute as migrações:

1. Acesse o terminal do serviço no Render
2. Execute: `pnpm run migrate:supabase-db`

## Passo 5: Deploy

1. Após configurar todas as variáveis de ambiente
2. Clique em "Deploy" no painel do serviço
3. Aguarde o build e deploy completarem
4. Acesse a URL fornecida pelo Render

## Estrutura de Arquivos para Render

```
├── render.yaml          # Configuração do serviço
├── Dockerfile           # Container para deploy
├── package.json         # Scripts otimizados
├── server/              # Código do servidor
├── client/              # Código do frontend
└── dist/                # Build de produção
```

## Scripts Disponíveis

- `build:render` - Build otimizado para Render
- `start:render` - Start com porta 10000
- `migrate:supabase-db` - Executar migrações

## Troubleshooting

### Erro de Build
- Verifique se todas as dependências estão no `package.json`
- Confirme se o `pnpm-lock.yaml` está commitado

### Erro de Conexão com Banco
- Verifique se a variável `DATABASE_URL` está configurada
- Confirme se o banco está linkado ao serviço

### Erro de Porta
- O Render usa a porta 10000 por padrão
- Verifique se a variável `PORT` está configurada

## Monitoramento

- Use o painel do Render para monitorar logs
- Configure alertas para erros críticos
- Monitore o uso de recursos

## Backup

- O Render oferece backup automático do banco
- Configure backup manual se necessário
- Exporte dados regularmente

## Suporte

- Documentação do Render: https://render.com/docs
- Logs do serviço no painel do Render
- Terminal integrado para debug
