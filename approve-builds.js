#!/usr/bin/env node

/**
 * Script para aprovar builds do pnpm
 * Resolve o problema de scripts de construção ignorados
 */

import { execSync } from 'node:child_process';

console.log('🔧 Aprovando scripts de construção do pnpm...');

try {
  // Aprova os scripts necessários
  // Habilita scripts pre/post para permitir postinstalls necessários (ex.: esbuild, @tailwindcss/oxide)
  execSync('pnpm config set enable-pre-post-scripts true', { stdio: 'inherit' });
  console.log('✅ Configuração pnpm enable-pre-post-scripts=true aplicada');

  console.log('\n🎉 Scripts de construção aprovados com sucesso!');
  console.log('\n📝 Para aplicar as mudanças, execute:');
  console.log('   pnpm install --force');
  
} catch (error) {
  console.error('❌ Erro ao aprovar scripts:', error.message);
  process.exit(1);
}

