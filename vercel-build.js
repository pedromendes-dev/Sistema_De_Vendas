#!/usr/bin/env node

// Script de build personalizado para Vercel
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build personalizado para Vercel...');

try {
  // 1. Verificar se as variáveis de ambiente estão definidas
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn('⚠️  Variáveis de ambiente ausentes:', missingVars.join(', '));
    console.warn('   Usando valores padrão para desenvolvimento...');
  }

  // 2. Executar build do Vite
  console.log('📦 Executando build do Vite...');
  execSync('pnpm build', { stdio: 'inherit' });

  // 3. Verificar se o build foi bem-sucedido
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('❌ Diretório dist não foi criado');
  }

  console.log('✅ Build concluído com sucesso!');
  console.log('📁 Arquivos gerados em:', distPath);

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
