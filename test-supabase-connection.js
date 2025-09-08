import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wgxnnylsmfvzyhzubzjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔌 Testando conexão com Supabase...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseKey.substring(0, 20) + '...');
  
  try {
    // Teste básico de conexão
    const { data, error } = await supabase
      .from('attendants')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro na conexão:', error.message);
      console.log('💡 Isso pode ser normal se as tabelas ainda não foram criadas.');
      console.log('📋 Execute o script SQL no painel do Supabase primeiro.');
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log('📊 Dados encontrados:', data);
    }
    
    // Teste de inserção simples
    console.log('\n🧪 Testando inserção de dados...');
    const { data: insertData, error: insertError } = await supabase
      .from('attendants')
      .insert([
        {
          name: 'Teste de Conexão',
          earnings: 0
        }
      ])
      .select();
    
    if (insertError) {
      console.log('❌ Erro na inserção:', insertError.message);
    } else {
      console.log('✅ Inserção funcionou! Dados:', insertData);
      
      // Limpar dados de teste
      if (insertData && insertData.length > 0) {
        await supabase
          .from('attendants')
          .delete()
          .eq('id', insertData[0].id);
        console.log('🧹 Dados de teste removidos');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
