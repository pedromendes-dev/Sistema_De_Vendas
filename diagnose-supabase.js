import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgxnylsmfvzyhzubzjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseSupabase() {
  console.log('🔍 DIAGNÓSTICO COMPLETO DO SUPABASE');
  console.log('=====================================');
  
  console.log('\n📋 Informações da Conexão:');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 30) + '...');
  
  // Teste 1: Verificar se a URL está acessível
  console.log('\n🌐 Teste 1: Verificando acessibilidade da URL...');
  try {
    const response = await fetch(supabaseUrl + '/rest/v1/');
    if (response.ok) {
      console.log('✅ URL do Supabase está acessível');
    } else {
      console.log('❌ URL retornou status:', response.status);
    }
  } catch (error) {
    console.log('❌ Erro ao acessar URL:', error.message);
    console.log('💡 Possíveis causas:');
    console.log('   - Firewall bloqueando a conexão');
    console.log('   - Proxy corporativo');
    console.log('   - Antivírus interferindo');
    console.log('   - Problema de rede');
  }
  
  // Teste 2: Verificar se as tabelas existem
  console.log('\n🗃️ Teste 2: Verificando existência das tabelas...');
  const tables = ['attendants', 'sales', 'goals', 'achievements', 'notifications', 'admins'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.message.includes('relation') && error.message.includes('does not exist')) {
          console.log(`❌ Tabela '${table}' não existe`);
        } else {
          console.log(`⚠️ Tabela '${table}' existe mas com erro:`, error.message);
        }
      } else {
        console.log(`✅ Tabela '${table}' existe e está acessível`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar tabela '${table}':`, error.message);
    }
  }
  
  // Teste 3: Verificar permissões
  console.log('\n🔐 Teste 3: Verificando permissões...');
  try {
    const { data, error } = await supabase
      .from('attendants')
      .insert([{ name: 'Teste Permissão', earnings: 0 }])
      .select();
    
    if (error) {
      console.log('❌ Erro de permissão:', error.message);
      console.log('💡 Verifique as políticas RLS no painel do Supabase');
    } else {
      console.log('✅ Permissões de escrita funcionando');
      
      // Limpar dados de teste
      if (data && data.length > 0) {
        await supabase
          .from('attendants')
          .delete()
          .eq('id', data[0].id);
        console.log('🧹 Dados de teste removidos');
      }
    }
  } catch (error) {
    console.log('❌ Erro geral de permissão:', error.message);
  }
  
  // Teste 4: Verificar dados existentes
  console.log('\n📊 Teste 4: Verificando dados existentes...');
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ Erro ao contar registros em '${table}':`, error.message);
      } else {
        console.log(`📈 Tabela '${table}': ${data?.length || 0} registros`);
      }
    } catch (error) {
      console.log(`❌ Erro ao verificar dados em '${table}':`, error.message);
    }
  }
  
  console.log('\n🎯 RESUMO DO DIAGNÓSTICO:');
  console.log('========================');
  console.log('1. Se a URL não está acessível: problema de rede/firewall');
  console.log('2. Se as tabelas não existem: execute o script SQL no painel');
  console.log('3. Se há erro de permissão: verifique as políticas RLS');
  console.log('4. Se tudo está OK: execute a migração!');
  
  console.log('\n📋 PRÓXIMOS PASSOS:');
  console.log('==================');
  console.log('1. Execute o script SQL no painel do Supabase');
  console.log('2. Execute: npm run migrate:supabase');
  console.log('3. Verifique os dados no painel');
}

diagnoseSupabase();
