# Configuração do Supabase para SistemaV

## 1. Informações do Projeto
- **URL do Projeto**: https://wgxnylsmfvzyhzubzjb.supabase.co
- **API Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM

## 2. Passos para Configuração

### Passo 1: Criar as Tabelas
1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Vá para o projeto `wgxnylsmfvzyhzubzjb`
3. Clique em **SQL Editor** no menu lateral
4. Cole e execute o conteúdo do arquivo `supabase-schema.sql`

### Passo 2: Obter a Senha do Banco
1. No painel do Supabase, vá em **Settings** > **Database**
2. Copie a **Database Password**
3. Substitua `[YOUR_PASSWORD]` no arquivo `migrate-to-supabase.js` pela senha real

### Passo 3: Executar a Migração
```bash
# Usando a API do Supabase (recomendado)
npm run migrate:supabase

# Ou usando conexão direta ao PostgreSQL
npm run migrate:supabase-db
```

## 3. Estrutura das Tabelas Criadas
- `admins` - Administradores do sistema
- `attendants` - Atendentes
- `sales` - Vendas
- `goals` - Metas
- `achievements` - Conquistas
- `notifications` - Notificações

## 4. Próximos Passos
Após criar as tabelas e executar a migração:
1. Atualizar o servidor para usar Supabase
2. Testar as funcionalidades
3. Configurar autenticação se necessário
