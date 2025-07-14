# 🚀 Comandos para Subir seu Projeto ao GitHub

## 📋 Pré-requisitos
- Ter o Git instalado no seu computador
- Ter uma conta no GitHub
- Fazer download do projeto do Replit

## 🔗 Passo a Passo

### 1. Baixar o Projeto do Replit
1. No Replit, clique no menu (3 linhas) no canto superior esquerdo
2. Clique em "Download as zip"
3. Extraia o arquivo zip no seu computador

### 2. Criar Repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "New repository" (botão verde)
3. Nome: `salescontrol` (ou o nome que preferir)
4. Descrição: `Sistema completo de gestão de vendas com React + TypeScript`
5. Deixe **Public** (ou Private se preferir)
6. **NÃO** marque "Add a README file"
7. Clique em "Create repository"

### 3. Executar Comandos no Terminal

Abra o terminal na pasta do projeto extraído e execute **um comando por vez**:

```bash
# 1. Inicializar repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer primeiro commit
git commit -m "🎉 SalesControl: Sistema completo de gestão de vendas

✨ Funcionalidades:
- Gestão completa de atendentes e vendas
- Sistema de metas e conquistas  
- Dashboard interativo com gráficos
- Notificações em tempo real
- Painel administrativo completo
- Mobile-first design responsivo
- Drag & drop interface
- Autenticação de admin

🛠️ Tecnologias:
- React 18 + TypeScript + Vite
- Express.js + PostgreSQL + Drizzle ORM
- Tailwind CSS + shadcn/ui
- TanStack Query + WebSockets
- Pronto para deploy no Vercel"

# 4. Renomear branch para main
git branch -M main

# 5. Adicionar remote do GitHub (SUBSTITUA 'SEU_USUARIO' pelo seu username)
git remote add origin https://github.com/SEU_USUARIO/salescontrol.git

# 6. Fazer push para o GitHub
git push -u origin main
```

### 4. Verificar o Upload
1. Atualize a página do seu repositório no GitHub
2. Você deve ver todos os arquivos do projeto
3. O README.md será exibido automaticamente

## 🚀 Deploy no Vercel (Opcional)

### Via GitHub (Recomendado)
1. Acesse [vercel.com](https://vercel.com)
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione seu repositório `salescontrol`
5. Configure a variável de ambiente:
   - Nome: `DATABASE_URL`
   - Valor: sua URL do PostgreSQL (ex: do Neon Database)
6. Clique em "Deploy"

### Via CLI
```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer deploy
vercel

# Seguir as instruções
```

## 🔧 Variáveis de Ambiente

Para funcionar em produção, você precisa de:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## 🆘 Solução de Problemas

### Se der erro de permissão:
```bash
# Use token pessoal do GitHub
# Vá em: GitHub Settings > Developer settings > Personal access tokens
# Crie um token e use como senha
```

### Se der erro de repositório existente:
```bash
# Force push (cuidado - sobrescreve tudo)
git push -f origin main
```

### Se algum arquivo for muito grande:
```bash
# Verificar arquivos grandes
git ls-files --others --ignored --exclude-standard

# Adicionar ao .gitignore
echo "arquivo-grande.zip" >> .gitignore
git add .gitignore
git commit -m "Update .gitignore"
```

## ✅ Checklist Final

Após subir, verifique se:
- [ ] Todos os arquivos estão no GitHub
- [ ] README.md está sendo exibido
- [ ] Não há arquivos sensíveis (.env, node_modules)
- [ ] O repositório está acessível
- [ ] A documentação está completa

---

🎉 **Sucesso!** Seu SalesControl estará no GitHub e pronto para ser compartilhado!