# Configurações de Ambiente para Render

## Variáveis de Ambiente Necessárias

Configure estas variáveis no painel do Render:

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
O Render automaticamente fornece a variável `DATABASE_URL` quando você conecta um banco PostgreSQL.

### Configurações de Segurança
```
JWT_SECRET=your-jwt-secret-here
BCRYPT_ROUNDS=10
```

### Configurações de Backup (opcional)
```
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE=0 3 * * *
```

## Como Configurar

1. No painel do Render, vá para o seu serviço
2. Clique em "Environment"
3. Adicione cada variável de ambiente
4. Reinicie o serviço após adicionar as variáveis
