# 🚀 Deploy Rápido - Instruções Simples

## Passo a Passo para GitHub + Vercel

### 1. Criar Repositório no GitHub
1. Acesse: https://github.com/new
2. Nome: `sistema-vendas-gamificado`
3. Descrição: `Sistema completo de vendas com gamificação para empresas`
4. Deixe **público** (ou privado se preferir)
5. **NÃO** marque "Add a README file"
6. Clique "Create repository"

### 2. Conectar ao GitHub
Copie e cole estes comandos no terminal:

```bash
git remote add origin https://github.com/SEU_USUARIO/sistema-vendas-gamificado.git
git branch -M main
git add .
git commit -m "Sistema de vendas pronto para produção"
git push -u origin main
```

**Substitua `SEU_USUARIO` pelo seu nome de usuário do GitHub**

### 3. Deploy na Vercel
1. Acesse: https://vercel.com
2. Faça login com GitHub
3. Clique "New Project"
4. Selecione o repositório `sistema-vendas-gamificado`
5. Configure variáveis de ambiente:
   ```
   DATABASE_URL = sua_url_do_postgresql_aqui
   ```
6. Clique "Deploy"

### 4. Banco de Dados (Neon - Gratuito)
1. Acesse: https://neon.tech
2. Crie conta gratuita
3. Crie novo database
4. Copie a "Connection string"
5. Cole na Vercel como `DATABASE_URL`

## ✅ Pronto!

Após alguns minutos, seu sistema estará online e funcionando!

### Login Administrativo:
- **Usuário:** `administrador`
- **Senha:** `root123`

### Links Úteis:
- **Documentação completa:** `MIGRAÇÃO_COMPLETA.md`
- **Guia de uso:** `COMO_BAIXAR.md`
- **Suporte Vercel:** https://vercel.com/docs

---

**Total estimado: 10-15 minutos para deploy completo**