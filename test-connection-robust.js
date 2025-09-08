import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

const supabaseUrl = 'https://wgxnylsmfvzyhzubzjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM';

async function testConnectionRobust() {
  console.log('🔧 TESTE ROBUSTO DE CONEXÃO SUPABASE');
  console.log('====================================');
  
  // Teste 1: Verificar se a URL está acessível via fetch nativo
  console.log('\n🌐 Teste 1: Verificando acessibilidade da URL...');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ URL acessível via fetch nativo');
      const data = await response.text();
      console.log('📄 Resposta:', data.substring(0, 100) + '...');
    } else {
      console.log('❌ URL retornou status:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro no fetch nativo:', error.message);
  }
  
  // Teste 2: Verificar se o projeto está ativo
  console.log('\n🔍 Teste 2: Verificando status do projeto...');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/', {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Projeto está ativo e acessível');
    } else if (response.status === 404) {
      console.log('❌ Projeto não encontrado (404)');
    } else if (response.status === 403) {
      console.log('❌ Acesso negado (403) - verifique a chave API');
    } else {
      console.log('⚠️ Status inesperado:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar status:', error.message);
  }
  
  // Teste 3: Verificar se as tabelas existem
  console.log('\n🗃️ Teste 3: Verificando existência das tabelas...');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/attendants?select=*&limit=1', {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Tabela attendants existe e está acessível');
    } else if (response.status === 404) {
      console.log('❌ Tabela attendants não existe');
    } else {
      console.log('⚠️ Erro ao acessar tabela:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro ao verificar tabela:', error.message);
  }
  
  // Teste 4: Testar com cliente Supabase
  console.log('\n🔌 Teste 4: Testando com cliente Supabase...');
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data, error } = await supabase
      .from('attendants')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('✅ Cliente Supabase funciona - tabelas não existem ainda');
      } else {
        console.log('⚠️ Cliente Supabase com erro:', error.message);
      }
    } else {
      console.log('✅ Cliente Supabase funciona perfeitamente');
    }
  } catch (error) {
    console.log('❌ Erro no cliente Supabase:', error.message);
  }
  
  console.log('\n🎯 CONCLUSÃO:');
  console.log('=============');
  console.log('Se o Teste 1 ou 2 funcionou, o projeto está ativo.');
  console.log('Se o Teste 3 falhou, as tabelas não existem ainda.');
  console.log('Se o Teste 4 funcionou, a migração deve funcionar.');
}

testConnectionRobust();
