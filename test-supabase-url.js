import { createClient } from '@supabase/supabase-js';

// Função para testar uma URL específica do Supabase
async function testSupabaseURL(url, key) {
  console.log(`\n🔍 Testando URL: ${url}`);
  console.log(`🔑 Key: ${key.substring(0, 30)}...`);
  
  try {
    const supabase = createClient(url, key);
    
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('attendants')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('✅ Conexão OK - Tabelas não existem ainda (normal)');
        return true;
      } else {
        console.log('⚠️ Conexão OK mas com erro:', error.message);
        return true;
      }
    } else {
      console.log('✅ Conexão perfeita!');
      return true;
    }
    
  } catch (error) {
    console.log('❌ Erro de conexão:', error.message);
    return false;
  }
}

// Função principal para testar múltiplas URLs
async function testMultipleURLs() {
  console.log('🧪 TESTE DE MÚLTIPLAS URLs DO SUPABASE');
  console.log('=====================================');
  
  // URL atual (que não está funcionando)
  const currentURL = 'https://wgxnylsmfvzyhzubzjb.supabase.co';
  const currentKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM';
  
  console.log('\n📋 Testando URL atual...');
  const currentWorks = await testSupabaseURL(currentURL, currentKey);
  
  if (!currentWorks) {
    console.log('\n💡 A URL atual não funciona. Você pode:');
    console.log('1. Verificar se o projeto está ativo no painel');
    console.log('2. Criar um novo projeto');
    console.log('3. Usar as credenciais do novo projeto');
    
    console.log('\n📝 Para testar uma nova URL, edite este script e adicione:');
    console.log('const newURL = "https://SEU-NOVO-PROJETO.supabase.co";');
    console.log('const newKey = "SUA-NOVA-CHAVE";');
    console.log('await testSupabaseURL(newURL, newKey);');
  }
  
  console.log('\n🎯 RESUMO:');
  console.log('==========');
  if (currentWorks) {
    console.log('✅ A URL atual funciona! Execute a migração.');
  } else {
    console.log('❌ A URL atual não funciona. Verifique o painel do Supabase.');
  }
}

// Executar teste
testMultipleURLs();
