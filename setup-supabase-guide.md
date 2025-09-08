# 🚀 Guia Completo para Configurar Supabase

## ⚠️ Problema Atual
O erro `TypeError: fetch failed` indica que há um problema de conectividade com o Supabase.

## 🔧 Soluções Possíveis

### 1. **Verificar se as Tabelas Existem**
Primeiro, você precisa criar as tabelas no painel do Supabase:

1. Acesse: https://supabase.com/dashboard
2. Vá para o projeto: `wgxnylsmfvzyhzubzjb`
3. Clique em **SQL Editor**
4. Cole e execute este código:

```sql
-- Verificar se as tabelas existem
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
```

### 2. **Criar as Tabelas (se não existirem)**
Execute o script `supabase-schema.sql` no SQL Editor do Supabase.

### 3. **Verificar Configurações de Rede**
O erro pode ser causado por:
- Firewall corporativo
- Proxy
- Antivírus bloqueando conexões

### 4. **Testar Conexão Manual**
Você pode testar a conexão diretamente no navegador:
- Acesse: https://wgxnylsmfvzyhzubzjb.supabase.co/rest/v1/
- Deve retornar informações da API

## 📋 Próximos Passos

1. **Execute o SQL no Supabase** primeiro
2. **Teste a conexão** no navegador
3. **Execute novamente** o script de migração

## 🛠️ Scripts Disponíveis

- `npm run migrate:supabase` - Migração usando API
- `npm run migrate:supabase-db` - Migração usando PostgreSQL direto
- `node test-supabase-connection.js` - Teste de conexão

## 📞 Se o Problema Persistir

1. Verifique se o projeto Supabase está ativo
2. Confirme se a API key está correta
3. Teste em uma rede diferente
4. Verifique logs do Supabase no painel
