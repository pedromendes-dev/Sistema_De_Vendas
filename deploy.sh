#!/bin/bash

# 🚀 Script de Deploy Automatizado - Sistema de Vendas
# Este script prepara o projeto para deploy na Vercel

echo "🚀 Iniciando preparação para deploy..."

# Verifica se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na raiz do projeto"
    exit 1
fi

# Limpa arquivos temporários
echo "🧹 Limpando arquivos temporários..."
rm -rf node_modules/.cache
rm -rf dist
rm -rf .vercel

# Instala dependências
echo "📦 Instalando dependências..."
npm install

# Executa build de teste
echo "🔨 Testando build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Corrija os erros antes do deploy."
    exit 1
fi

# Verifica arquivos essenciais
echo "📋 Verificando arquivos essenciais..."

required_files=(
    "vercel.json"
    "package.json"
    ".env.example"
    "README.md"
)

for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Arquivo obrigatório não encontrado: $file"
        exit 1
    fi
done

# Verifica se DATABASE_URL está configurada
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  Aviso: DATABASE_URL não configurada"
    echo "   Configure esta variável na Vercel após o deploy"
fi

# Mostra status do Git
echo "📊 Status do repositório Git:"
git status --porcelain

# Pergunta se deve fazer commit
echo ""
read -p "🤔 Fazer commit das alterações? (y/N): " commit_choice

if [ "$commit_choice" = "y" ] || [ "$commit_choice" = "Y" ]; then
    echo "💾 Fazendo commit..."
    git add .
    git commit -m "Deploy: Sistema de vendas pronto para produção"
    
    read -p "📤 Fazer push para GitHub? (y/N): " push_choice
    
    if [ "$push_choice" = "y" ] || [ "$push_choice" = "Y" ]; then
        echo "🌐 Enviando para GitHub..."
        git push origin main
    fi
fi

# Mostra informações de deploy
echo ""
echo "✅ Preparação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Acesse https://vercel.com"
echo "2. Conecte este repositório"
echo "3. Configure as variáveis de ambiente:"
echo "   DATABASE_URL=postgresql://..."
echo "   NODE_ENV=production"
echo "4. Clique em Deploy"
echo ""
echo "📚 Documentação completa em:"
echo "   - MIGRAÇÃO_COMPLETA.md"
echo "   - DEPLOY_VERCEL.md"
echo "   - README.md"
echo ""
echo "🔐 Login administrativo:"
echo "   Usuário: administrador"
echo "   Senha: root123"
echo ""
echo "🎉 Sistema pronto para produção!"