#!/bin/bash

# Script de Deploy para Vercel
# Sistema de Gestão de Vendas

echo "🚀 Iniciando processo de deploy para Vercel..."

# Verificar se o projeto tem as dependências
echo "📦 Verificando dependências..."
if [ ! -f "package.json" ]; then
    echo "❌ Arquivo package.json não encontrado!"
    exit 1
fi

# Verificar se o arquivo vercel.json existe
if [ ! -f "vercel.json" ]; then
    echo "❌ Arquivo vercel.json não encontrado!"
    exit 1
fi

# Instalar dependências
echo "📥 Instalando dependências..."
npm install

# Verificar se há erros de TypeScript
echo "🔍 Verificando tipos TypeScript..."
npm run check

# Fazer build do projeto
echo "🔨 Fazendo build do projeto..."
npm run build

# Verificar se a build foi bem-sucedida
if [ $? -eq 0 ]; then
    echo "✅ Build concluída com sucesso!"
else
    echo "❌ Erro durante a build!"
    exit 1
fi

# Instruções para deploy
echo ""
echo "🎯 Projeto pronto para deploy!"
echo ""
echo "📋 Próximos passos:"
echo "1. Crie um repositório no GitHub"
echo "2. Faça upload de todos os arquivos"
echo "3. Conecte o repositório ao Vercel"
echo "4. Configure as variáveis de ambiente:"
echo "   - DATABASE_URL"
echo "   - PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE"
echo "   - NODE_ENV=production"
echo "5. Deploy automático será executado"
echo ""
echo "📖 Consulte DEPLOY_VERCEL.md para instruções detalhadas"
echo ""
echo "🎉 Sistema está pronto para produção!"