#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build para Render...');

try {
  // Verificar se estamos no ambiente correto
  console.log('📦 Instalando dependências...');
  execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });

  console.log('🔨 Compilando servidor TypeScript...');
  execSync('pnpm run build:server', { stdio: 'inherit' });

  console.log('🎨 Compilando frontend...');
  execSync('pnpm run build', { stdio: 'inherit' });

  // Verificar se os arquivos foram criados
  const distPath = path.join(process.cwd(), 'dist');
  if (!fs.existsSync(distPath)) {
    throw new Error('Pasta dist não foi criada');
  }

  const publicPath = path.join(distPath, 'public');
  if (!fs.existsSync(publicPath)) {
    throw new Error('Pasta dist/public não foi criada');
  }

  console.log('✅ Build concluído com sucesso!');
  console.log('📁 Arquivos gerados em:', distPath);

} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
