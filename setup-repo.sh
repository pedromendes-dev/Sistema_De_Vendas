#!/bin/bash

# 🚀 Script de Configuração do Repositório Git
# Execute este script após baixar o projeto do Replit

echo "🚀 Configurando repositório Git para migração..."

# Verificar se já existe .git
if [ -d ".git" ]; then
    echo "📁 Removendo repositório Git existente..."
    rm -rf .git
fi

# Inicializar novo repositório
echo "🔧 Inicializando novo repositório Git..."
git init

# Configurar usuário (substitua pelos seus dados)
echo "👤 Configurando usuário Git..."
echo "Digite seu nome para o Git:"
read -p "Nome: " git_name
echo "Digite seu email para o Git:"
read -p "Email: " git_email

git config user.name "$git_name"
git config user.email "$git_email"

# Adicionar todos os arquivos
echo "📦 Adicionando arquivos ao repositório..."
git add .

# Fazer commit inicial
echo "💾 Fazendo commit inicial..."
git commit -m "Sistema de gestão de vendas - Migração do Replit"

# Instruções para conectar ao GitHub
echo ""
echo "🎯 PRÓXIMOS PASSOS:"
echo ""
echo "1. Crie um repositório no GitHub (https://github.com)"
echo "2. Execute os comandos abaixo (substitua SEU-USUARIO e SEU-REPO):"
echo ""
echo "   git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Faça deploy no Vercel:"
echo "   - Acesse https://vercel.com"
echo "   - Conecte seu repositório GitHub"
echo "   - Configure as variáveis de ambiente"
echo ""
echo "✅ Repositório configurado com sucesso!"
echo "📖 Consulte MIGRAÇÃO_COMPLETA.md para instruções detalhadas"