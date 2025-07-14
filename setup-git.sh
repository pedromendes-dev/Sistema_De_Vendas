#!/bin/bash

echo "🚀 Configurando repositório Git para SalesControl..."

# Inicializar Git se não existir
if [ ! -d ".git" ]; then
    echo "📝 Inicializando repositório Git..."
    git init
else
    echo "✅ Repositório Git já existe"
fi

# Configurar .gitignore se necessário
if [ ! -f ".gitignore" ]; then
    echo "📋 Criando .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.tsbuildinfo

# Logs
logs/
*.log

# Database
*.db
*.sqlite

# OS generated files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Replit specific
.replit
replit.nix

# Temporary files
tmp/
temp/
EOL
fi

# Adicionar todos os arquivos
echo "📦 Adicionando arquivos ao staging..."
git add .

# Fazer commit inicial
echo "💾 Fazendo commit inicial..."
git commit -m "🎉 Initial commit: SalesControl Sistema de Gestão de Vendas

✨ Funcionalidades implementadas:
- Sistema completo de gestão de vendas
- Controle de atendentes com CRUD completo
- Sistema de metas e conquistas
- Dashboard com gráficos em tempo real
- Notificações inteligentes
- Painel administrativo
- Design mobile-first e responsivo
- Autenticação de admin
- Drag & drop para organização
- WebSockets para atualizações em tempo real

🛠️ Tecnologias:
- React 18 + TypeScript
- Express.js + PostgreSQL
- Tailwind CSS + shadcn/ui
- Drizzle ORM + Neon Database
- TanStack Query + Wouter
- Pronto para deploy no Vercel"

echo ""
echo "✅ Repositório configurado com sucesso!"
echo ""
echo "🔗 Próximos passos para GitHub:"
echo "1. Crie um repositório no GitHub"
echo "2. Execute: git remote add origin https://github.com/SEU_USUARIO/salescontrol.git"
echo "3. Execute: git branch -M main"
echo "4. Execute: git push -u origin main"
echo ""
echo "🚀 Para deploy no Vercel:"
echo "1. Acesse https://vercel.com"
echo "2. Conecte seu repositório GitHub"
echo "3. Configure a variável DATABASE_URL"
echo "4. Deploy automático!"