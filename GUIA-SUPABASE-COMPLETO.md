# 🚀 Guia Completo - SistemaV + Supabase

## 📋 **Passo 1: Acessar o Painel do Supabase**

1. **Abra o navegador** e acesse: https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Selecione o projeto**: `wgxnylsmfvzyhzubzjb`

## 📋 **Passo 2: Criar as Tabelas**

1. **No menu lateral**, clique em **"SQL Editor"**
2. **Clique em "New Query"**
3. **Cole todo o conteúdo** do arquivo `supabase-schema.sql` (que está na raiz do projeto)
4. **Clique em "Run"** para executar o script

### ✅ **O que o script vai criar:**
- Tabela `admins` - Administradores
- Tabela `attendants` - Atendentes  
- Tabela `sales` - Vendas
- Tabela `goals` - Metas
- Tabela `achievements` - Conquistas
- Tabela `notifications` - Notificações
- Índices para performance
- Triggers para atualização automática
- Políticas de segurança (RLS)

## 📋 **Passo 3: Verificar se as Tabelas Foram Criadas**

1. **No menu lateral**, clique em **"Table Editor"**
2. **Verifique se aparecem** as 6 tabelas listadas acima
3. **Se apareceram**, as tabelas foram criadas com sucesso! ✅

## 📋 **Passo 4: Executar a Migração dos Dados**

Volte para o terminal e execute:

```bash
# Testar conexão primeiro
node test-supabase-connection.js

# Se a conexão funcionar, executar migração
npm run migrate:supabase
```

## 📋 **Passo 5: Verificar os Dados Migrados**

1. **No painel do Supabase**, vá em **"Table Editor"**
2. **Clique em cada tabela** para ver se os dados foram migrados
3. **Verifique especialmente**:
   - `attendants` - deve ter seus atendentes
   - `sales` - deve ter suas vendas
   - `notifications` - deve ter suas notificações

## 🔧 **Se Houver Problemas**

### ❌ **Erro: "fetch failed"**
- Verifique se as tabelas foram criadas
- Teste a conexão no navegador: https://wgxnylsmfvzyhzubzjb.supabase.co/rest/v1/

### ❌ **Erro: "relation does not exist"**
- As tabelas não foram criadas
- Execute novamente o script SQL

### ❌ **Erro: "permission denied"**
- Verifique as políticas RLS no painel
- Temporariamente, você pode desabilitar RLS para teste

## 🎯 **Próximos Passos (Após Migração)**

1. **Atualizar o servidor** para usar Supabase
2. **Testar todas as funcionalidades**
3. **Configurar autenticação** se necessário
4. **Fazer backup** dos dados migrados

## 📞 **Precisa de Ajuda?**

Se encontrar algum problema:
1. Verifique os logs no painel do Supabase
2. Teste a conexão no navegador
3. Execute os scripts de teste que criei

---

**🚀 Boa sorte com a migração!**
