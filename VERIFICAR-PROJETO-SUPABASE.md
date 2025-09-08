# 🔍 Guia para Verificar Projeto Supabase

## 📋 **Passo 1: Acessar o Painel do Supabase**

1. **Abra o navegador** e acesse: https://supabase.com/dashboard
2. **Faça login** na sua conta
3. **Procure pelo projeto** `wgxnylsmfvzyhzubzjb`

## 📋 **Passo 2: Verificar Status do Projeto**

### **Cenário A: Projeto Existe e Está Ativo** ✅
- Você verá o projeto na lista
- Status: "Active" ou "Running"
- **Ação**: Pule para o Passo 4

### **Cenário B: Projeto Existe mas Está Pausado** ⏸️
- Você verá o projeto na lista
- Status: "Paused" ou "Inactive"
- **Ação**: Clique em "Resume" ou "Activate"

### **Cenário C: Projeto Não Existe** ❌
- O projeto não aparece na lista
- **Ação**: Vá para o Passo 3

## 📋 **Passo 3: Criar Novo Projeto (se necessário)**

1. **Clique em "New Project"**
2. **Preencha os dados**:
   - Nome: `SistemaV` ou `SistemaV-Production`
   - Senha do banco: (escolha uma senha forte)
   - Região: escolha a mais próxima
3. **Clique em "Create new project"**
4. **Aguarde a criação** (pode levar alguns minutos)

## 📋 **Passo 4: Obter Novas Credenciais**

1. **Vá em Settings** > **API**
2. **Copie as informações**:
   - Project URL
   - anon public key
   - service_role key (se necessário)

## 📋 **Passo 5: Atualizar Configurações**

Se você criou um novo projeto, preciso atualizar os arquivos de configuração com as novas credenciais.

**Me informe:**
- A nova URL do projeto
- A nova chave anônima (anon key)

## 📋 **Passo 6: Testar Conexão**

Após atualizar as configurações, vou executar:
```bash
node diagnose-supabase.js
```

## 🎯 **O que esperar:**

- ✅ **Se o projeto estiver ativo**: Conexão funcionará
- ⏸️ **Se estiver pausado**: Reative e teste novamente
- 🆕 **Se criar novo projeto**: Atualize credenciais e teste

---

## 📞 **Me informe o resultado:**

Depois de verificar, me diga:
1. **O projeto existe?**
2. **Qual o status?** (Active/Paused/Inactive)
3. **Se criou novo projeto, quais são as novas credenciais?**

Assim posso ajudar você a configurar tudo corretamente! 🚀
