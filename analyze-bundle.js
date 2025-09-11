#!/usr/bin/env node

/**
 * Script para analisar o bundle e mostrar estatísticas dos chunks
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeBundle() {
  const distPath = path.join(__dirname, 'dist', 'public', 'assets');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ Diretório dist/public/assets não encontrado. Execute "pnpm build" primeiro.');
    return;
  }

  const files = fs.readdirSync(distPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  
  console.log('📊 Análise do Bundle - Sistema de Vendas\n');
  console.log('=' .repeat(60));
  
  const chunks = jsFiles.map(file => {
    const filePath = path.join(distPath, file);
    const stats = fs.statSync(filePath);
    const sizeKB = stats.size / 1024;
    
    return {
      name: file,
      size: stats.size,
      sizeKB: sizeKB,
      category: getChunkCategory(file)
    };
  }).sort((a, b) => b.size - a.size);

  // Estatísticas gerais
  const totalSize = chunks.reduce((sum, chunk) => sum + chunk.size, 0);
  const totalSizeKB = totalSize / 1024;
  const chunksOver500KB = chunks.filter(chunk => chunk.sizeKB > 500);
  const chunksOver100KB = chunks.filter(chunk => chunk.sizeKB > 100);

  console.log(`📈 Estatísticas Gerais:`);
  console.log(`   Total de chunks: ${chunks.length}`);
  console.log(`   Tamanho total: ${formatBytes(totalSize)}`);
  console.log(`   Chunks > 500KB: ${chunksOver500KB.length}`);
  console.log(`   Chunks > 100KB: ${chunksOver100KB.length}`);
  console.log('');

  // Chunks por categoria
  const categories = {};
  chunks.forEach(chunk => {
    if (!categories[chunk.category]) {
      categories[chunk.category] = [];
    }
    categories[chunk.category].push(chunk);
  });

  console.log('📦 Chunks por Categoria:');
  Object.entries(categories).forEach(([category, categoryChunks]) => {
    const categorySize = categoryChunks.reduce((sum, chunk) => sum + chunk.size, 0);
    console.log(`   ${category}: ${categoryChunks.length} chunks (${formatBytes(categorySize)})`);
  });
  console.log('');

  // Top 10 maiores chunks
  console.log('🔝 Top 10 Maiores Chunks:');
  chunks.slice(0, 10).forEach((chunk, index) => {
    const status = chunk.sizeKB > 500 ? '⚠️ ' : chunk.sizeKB > 100 ? '⚡ ' : '✅ ';
    console.log(`   ${index + 1}. ${status}${chunk.name}`);
    console.log(`      Tamanho: ${formatBytes(chunk.size)} (${chunk.sizeKB.toFixed(1)} KB)`);
    console.log(`      Categoria: ${chunk.category}`);
    console.log('');
  });

  // Recomendações
  console.log('💡 Recomendações:');
  if (chunksOver500KB.length > 0) {
    console.log('   ⚠️  Ainda existem chunks > 500KB. Considere:');
    chunksOver500KB.forEach(chunk => {
      console.log(`      - ${chunk.name}: ${formatBytes(chunk.size)}`);
    });
    console.log('      - Implementar lazy loading mais granular');
    console.log('      - Separar bibliotecas grandes em chunks próprios');
  } else {
    console.log('   ✅ Todos os chunks estão abaixo de 500KB!');
  }
  
  if (chunksOver100KB.length > 5) {
    console.log('   ⚡ Muitos chunks grandes (>100KB). Considere:');
    console.log('      - Otimizar imports desnecessários');
    console.log('      - Usar tree-shaking mais agressivo');
  }

  console.log('');
  console.log('🎯 Próximos Passos:');
  console.log('   1. Teste o carregamento em produção');
  console.log('   2. Monitore Core Web Vitals');
  console.log('   3. Configure cache headers para chunks estáticos');
  console.log('   4. Considere implementar Service Worker para cache');
}

function getChunkCategory(filename) {
  if (filename.includes('react-core')) return 'React Core';
  if (filename.includes('react-dom')) return 'React DOM';
  if (filename.includes('vendor')) return 'Vendor Libraries';
  if (filename.includes('ui-vendor')) return 'UI Libraries';
  if (filename.includes('charts-vendor')) return 'Charts Libraries';
  if (filename.includes('date-vendor')) return 'Date Libraries';
  if (filename.includes('query-vendor')) return 'Query Library';
  if (filename.includes('router-vendor')) return 'Router Library';
  if (filename.includes('dashboard-page')) return 'Dashboard Page';
  if (filename.includes('admin-page')) return 'Admin Page';
  if (filename.includes('dashboard-components')) return 'Dashboard Components';
  if (filename.includes('ui-components')) return 'UI Components';
  if (filename.includes('pages')) return 'Other Pages';
  if (filename.includes('components')) return 'Other Components';
  return 'Application Code';
}

// Executar análise
analyzeBundle();
