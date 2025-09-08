import fs from 'fs';
import path from 'path';

// Função para atualizar as configurações do Supabase
function updateSupabaseConfig(newUrl, newKey) {
  console.log('🔄 Atualizando configurações do Supabase...');
  
  try {
    // Atualizar arquivo do cliente
    const clientConfigPath = 'client/src/lib/supabase.ts';
    let clientConfig = fs.readFileSync(clientConfigPath, 'utf8');
    
    clientConfig = clientConfig.replace(
      /const supabaseUrl = '[^']*'/,
      `const supabaseUrl = '${newUrl}'`
    );
    
    clientConfig = clientConfig.replace(
      /const supabaseAnonKey = '[^']*'/,
      `const supabaseAnonKey = '${newKey}'`
    );
    
    fs.writeFileSync(clientConfigPath, clientConfig);
    console.log('✅ Configuração do cliente atualizada');
    
    // Atualizar arquivo do servidor
    const serverConfigPath = 'server/supabase.ts';
    let serverConfig = fs.readFileSync(serverConfigPath, 'utf8');
    
    serverConfig = serverConfig.replace(
      /const supabaseUrl = '[^']*'/,
      `const supabaseUrl = '${newUrl}'`
    );
    
    serverConfig = serverConfig.replace(
      /const supabaseKey = '[^']*'/,
      `const supabaseKey = '${newKey}'`
    );
    
    fs.writeFileSync(serverConfigPath, serverConfig);
    console.log('✅ Configuração do servidor atualizada');
    
    // Atualizar script de migração
    const migrationPath = 'migrate-to-supabase-api.js';
    let migrationScript = fs.readFileSync(migrationPath, 'utf8');
    
    migrationScript = migrationScript.replace(
      /const supabaseUrl = '[^']*'/,
      `const supabaseUrl = '${newUrl}'`
    );
    
    migrationScript = migrationScript.replace(
      /const supabaseKey = '[^']*'/,
      `const supabaseKey = '${newKey}'`
    );
    
    fs.writeFileSync(migrationPath, migrationScript);
    console.log('✅ Script de migração atualizado');
    
    // Atualizar script de teste
    const testPath = 'test-supabase-connection.js';
    let testScript = fs.readFileSync(testPath, 'utf8');
    
    testScript = testScript.replace(
      /const supabaseUrl = '[^']*'/,
      `const supabaseUrl = '${newUrl}'`
    );
    
    testScript = testScript.replace(
      /const supabaseKey = '[^']*'/,
      `const supabaseKey = '${newKey}'`
    );
    
    fs.writeFileSync(testPath, testScript);
    console.log('✅ Script de teste atualizado');
    
    console.log('\n🎉 Todas as configurações foram atualizadas!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: node test-supabase-connection.js');
    console.log('2. Se funcionar, execute: npm run migrate:supabase');
    console.log('3. Teste as funcionalidades do sistema');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
  }
}

// Função para criar arquivo de configuração
function createConfigFile() {
  const configContent = `# Configuração do Supabase - SistemaV

## Como usar este script:

1. Edite este arquivo e substitua as credenciais abaixo
2. Execute: node update-supabase-config.js

## Credenciais do Supabase:

const newUrl = 'https://SEU-NOVO-PROJETO.supabase.co';
const newKey = 'SUA-NOVA-CHAVE-ANONIMA';

## Exemplo:
const newUrl = 'https://abcdefghijklmnop.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

## Depois de configurar, execute:
updateSupabaseConfig(newUrl, newKey);
`;

  fs.writeFileSync('config-supabase.js', configContent);
  console.log('📁 Arquivo config-supabase.js criado!');
  console.log('📝 Edite o arquivo com suas credenciais e execute: node config-supabase.js');
}

// Verificar se foi chamado diretamente
if (process.argv.length >= 4) {
  const newUrl = process.argv[2];
  const newKey = process.argv[3];
  
  if (newUrl && newKey) {
    updateSupabaseConfig(newUrl, newKey);
  } else {
    console.log('❌ Uso: node update-supabase-config.js <URL> <KEY>');
  }
} else {
  createConfigFile();
}
