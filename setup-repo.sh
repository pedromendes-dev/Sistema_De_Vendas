#!/bin/bash

# 🔧 Script de Configuração do Repositório Git
# Este script prepara o projeto para ser enviado ao GitHub

echo "🚀 Configurando repositório Git para o Sistema de Vendas..."

# Verifica se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Inicializa repositório Git se não existir
if [ ! -d ".git" ]; then
    echo "📦 Inicializando repositório Git..."
    git init
    echo "✅ Repositório Git criado"
else
    echo "📦 Repositório Git já existe"
fi

# Cria .gitignore se não existir
if [ ! -f ".gitignore" ]; then
    echo "📄 Criando .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds
dist/
build/

# Environment files
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Vercel
.vercel

# Database
*.db
*.sqlite

# IDEs
.vscode/
.idea/
*.swp
*.swo

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary files
*.tmp
*.temp

# Cache
.cache/
EOF
    echo "✅ .gitignore criado"
fi

# Adiciona todos os arquivos
echo "📁 Adicionando arquivos ao Git..."
git add .

# Faz commit inicial se não houver commits
if ! git rev-parse --verify HEAD >/dev/null 2>&1; then
    echo "💾 Fazendo commit inicial..."
    git commit -m "🚀 Sistema de Vendas Gamificado - Versão Produção

✅ Funcionalidades implementadas:
- Sistema completo de gestão de vendas
- Gamificação com pontos e rankings
- Painel administrativo profissional
- Sistema de metas e conquistas
- Notificações em tempo real
- Design responsivo mobile-first
- Pronto para deploy na Vercel

🔧 Tecnologias:
- React 18 + TypeScript
- Express.js + PostgreSQL
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Neon Database

📚 Documentação:
- MIGRAÇÃO_COMPLETA.md - Guia de deploy
- COMO_BAIXAR.md - Instruções de uso
- README.md - Documentação técnica"
    
    echo "✅ Commit inicial realizado"
else
    echo "💾 Fazendo commit das alterações..."
    git commit -m "🔄 Atualização: Sistema limpo e pronto para produção

- Dados de demonstração removidos
- Sistema de configuração implementado
- Documentação de deploy atualizada
- Pronto para uso comercial"
    echo "✅ Commit realizado"
fi

# Instruções para conectar ao GitHub
echo ""
echo "🌐 PRÓXIMOS PASSOS PARA GITHUB:"
echo ""
echo "1. Crie um repositório no GitHub:"
echo "   - Acesse: https://github.com/new"
echo "   - Nome sugerido: sistema-vendas-gamificado"
echo "   - Descrição: Sistema completo de vendas com gamificação"
echo "   - Mantenha como público ou privado (sua escolha)"
echo "   - NÃO inicialize com README (já temos um)"
echo ""
echo "2. Conecte este repositório local ao GitHub:"
echo "   git remote add origin https://github.com/SEU_USUARIO/NOME_DO_REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Para futuras atualizações:"
echo "   git add ."
echo "   git commit -m \"Sua mensagem\""
echo "   git push"
echo ""
echo "🚀 DEPLOY NA VERCEL:"
echo ""
echo "Após enviar para o GitHub:"
echo "1. Acesse: https://vercel.com"
echo "2. Clique 'New Project'"
echo "3. Selecione seu repositório"
echo "4. Configure variável: DATABASE_URL"
echo "5. Clique 'Deploy'"
echo ""
echo "📚 Documentação completa em:"
echo "   - MIGRAÇÃO_COMPLETA.md"
echo "   - DEPLOY_VERCEL.md"
echo "   - README.md"
echo ""
echo "✅ Repositório configurado e pronto!"
echo "🎉 Seu sistema está pronto para ser compartilhado!"