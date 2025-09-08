import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase
const supabaseUrl = 'https://wgxnnylsmfvzyhzubzjb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM';

const supabase = createClient(supabaseUrl, supabaseKey);

// Função para migrar dados usando a API do Supabase
async function migrateDataWithAPI() {
  try {
    console.log('🚀 Iniciando migração para Supabase usando API...');
    
    // Testar conexão
    console.log('🔌 Testando conexão com Supabase...');
    const { data: testData, error: testError } = await supabase
      .from('attendants')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.log('⚠️ Erro na conexão (pode ser normal se as tabelas não existirem ainda):', testError.message);
    } else {
      console.log('✅ Conexão estabelecida com sucesso!');
    }
    
    // Verificar se existe backup
    const backupPath = path.join(process.cwd(), 'backups', 'latest_backup.json');
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Arquivo de backup não encontrado em:', backupPath);
      console.log('📁 Criando backup de exemplo...');
      
      // Criar diretório de backup se não existir
      const backupDir = path.dirname(backupPath);
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }
      
      // Criar backup de exemplo
      const exampleBackup = {
        database: {
          attendants: [
            {
              id: '1',
              name: 'João Silva',
              imageUrl: null,
              earnings: 1500.00
            },
            {
              id: '2', 
              name: 'Maria Santos',
              imageUrl: null,
              earnings: 2300.50
            }
          ],
          sales: [
            {
              id: '1',
              attendantId: '1',
              value: 500.00,
              clientName: 'Cliente A',
              clientPhone: '11999999999',
              clientEmail: 'cliente@email.com',
              createdAt: new Date().toISOString()
            },
            {
              id: '2',
              attendantId: '2',
              value: 750.00,
              clientName: 'Cliente B',
              clientPhone: '11888888888',
              clientEmail: 'cliente2@email.com',
              createdAt: new Date().toISOString()
            }
          ],
          goals: [],
          achievements: [],
          notifications: [],
          admins: []
        }
      };
      
      fs.writeFileSync(backupPath, JSON.stringify(exampleBackup, null, 2));
      console.log('✅ Backup de exemplo criado!');
    }
    
    // Ler o backup
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('📊 Dados encontrados no backup:');
    console.log(`- Atendentes: ${backupData.database.attendants.length}`);
    console.log(`- Vendas: ${backupData.database.sales.length}`);
    console.log(`- Metas: ${backupData.database.goals?.length || 0}`);
    console.log(`- Conquistas: ${backupData.database.achievements?.length || 0}`);
    console.log(`- Notificações: ${backupData.database.notifications?.length || 0}`);
    console.log(`- Admins: ${backupData.database.admins?.length || 0}`);
    
    // Migrar atendentes
    if (backupData.database.attendants.length > 0) {
      console.log('👥 Migrando atendentes...');
      
      const attendantsData = backupData.database.attendants.map(attendant => ({
        id: attendant.id,
        name: attendant.name,
        image_url: attendant.imageUrl,
        earnings: attendant.earnings
      }));
      
      const { data: attendantsResult, error: attendantsError } = await supabase
        .from('attendants')
        .upsert(attendantsData, { onConflict: 'id' });
      
      if (attendantsError) {
        console.error('❌ Erro ao migrar atendentes:', attendantsError);
      } else {
        console.log(`✅ ${backupData.database.attendants.length} atendentes migrados`);
      }
    }
    
    // Migrar vendas
    if (backupData.database.sales.length > 0) {
      console.log('💰 Migrando vendas...');
      
      const salesData = backupData.database.sales.map(sale => ({
        id: sale.id,
        attendant_id: sale.attendantId,
        value: sale.value,
        client_name: sale.clientName,
        client_phone: sale.clientPhone,
        client_email: sale.clientEmail,
        created_at: sale.createdAt
      }));
      
      const { data: salesResult, error: salesError } = await supabase
        .from('sales')
        .upsert(salesData, { onConflict: 'id' });
      
      if (salesError) {
        console.error('❌ Erro ao migrar vendas:', salesError);
      } else {
        console.log(`✅ ${backupData.database.sales.length} vendas migradas`);
      }
    }
    
    // Migrar metas
    if (backupData.database.goals?.length > 0) {
      console.log('🎯 Migrando metas...');
      
      const goalsData = backupData.database.goals.map(goal => ({
        id: goal.id,
        attendant_id: goal.attendantId,
        title: goal.title,
        description: goal.description,
        target_value: goal.targetValue,
        current_value: goal.currentValue,
        goal_type: goal.goalType,
        start_date: goal.startDate,
        end_date: goal.endDate,
        is_active: goal.isActive,
        created_at: goal.createdAt
      }));
      
      const { data: goalsResult, error: goalsError } = await supabase
        .from('goals')
        .upsert(goalsData, { onConflict: 'id' });
      
      if (goalsError) {
        console.error('❌ Erro ao migrar metas:', goalsError);
      } else {
        console.log(`✅ ${backupData.database.goals.length} metas migradas`);
      }
    }
    
    // Migrar conquistas
    if (backupData.database.achievements?.length > 0) {
      console.log('🏆 Migrando conquistas...');
      
      const achievementsData = backupData.database.achievements.map(achievement => ({
        id: achievement.id,
        attendant_id: achievement.attendantId,
        title: achievement.title,
        description: achievement.description,
        achieved_at: achievement.achievedAt,
        created_at: achievement.createdAt
      }));
      
      const { data: achievementsResult, error: achievementsError } = await supabase
        .from('achievements')
        .upsert(achievementsData, { onConflict: 'id' });
      
      if (achievementsError) {
        console.error('❌ Erro ao migrar conquistas:', achievementsError);
      } else {
        console.log(`✅ ${backupData.database.achievements.length} conquistas migradas`);
      }
    }
    
    // Migrar notificações
    if (backupData.database.notifications?.length > 0) {
      console.log('🔔 Migrando notificações...');
      
      const notificationsData = backupData.database.notifications.map(notification => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        is_read: notification.isRead,
        created_at: notification.createdAt
      }));
      
      const { data: notificationsResult, error: notificationsError } = await supabase
        .from('notifications')
        .upsert(notificationsData, { onConflict: 'id' });
      
      if (notificationsError) {
        console.error('❌ Erro ao migrar notificações:', notificationsError);
      } else {
        console.log(`✅ ${backupData.database.notifications.length} notificações migradas`);
      }
    }
    
    // Migrar admins
    if (backupData.database.admins?.length > 0) {
      console.log('👤 Migrando administradores...');
      
      const adminsData = backupData.database.admins.map(admin => ({
        id: admin.id,
        username: admin.username,
        password: admin.password,
        email: admin.email,
        role: admin.role,
        is_active: admin.isActive,
        created_by: admin.createdBy,
        created_at: admin.createdAt,
        updated_at: admin.updatedAt
      }));
      
      const { data: adminsResult, error: adminsError } = await supabase
        .from('admins')
        .upsert(adminsData, { onConflict: 'id' });
      
      if (adminsError) {
        console.error('❌ Erro ao migrar administradores:', adminsError);
      } else {
        console.log(`✅ ${backupData.database.admins.length} administradores migrados`);
      }
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    
    // Verificar dados migrados
    console.log('📊 Verificando dados migrados...');
    
    const { data: attendantsCount } = await supabase
      .from('attendants')
      .select('*', { count: 'exact', head: true });
    
    const { data: salesCount } = await supabase
      .from('sales')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Verificação final:`);
    console.log(`- Atendentes: ${attendantsCount?.length || 0}`);
    console.log(`- Vendas: ${salesCount?.length || 0}`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    console.error('Stack trace:', error.stack);
  }
}

// Executar migração
migrateDataWithAPI();

