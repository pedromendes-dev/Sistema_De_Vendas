import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

// Função para migrar dados
async function migrateData() {
  let pool;
  
  try {
    console.log('🚀 Iniciando migração para Supabase...');
    
    // Verificar variáveis de ambiente
    console.log('🔍 Verificando variáveis de ambiente...');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Definida' : '❌ Não definida');
    console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Definida' : '❌ Não definida');
    
    // URL do Supabase (você precisa substituir [YOUR_PASSWORD] pela senha real)
    const supabaseUrl = process.env.POSTGRES_URL || 'postgresql://postgres:[YOUR_PASSWORD]@db.wgxnylsmfvzyhzubzjb.supabase.co:5432/postgres';
    
    if (supabaseUrl.includes('[YOUR_PASSWORD]')) {
      throw new Error('Por favor, substitua [YOUR_PASSWORD] na URL do Supabase pela senha real do banco de dados');
    }
    
    // Configuração do banco Supabase usando a URL completa
    console.log('🔌 Conectando ao Supabase...');
    pool = new Pool({
      connectionString: supabaseUrl,
      ssl: {
        rejectUnauthorized: false
      }
    });
    
    // Ler o backup mais recente
    const backupPath = path.join(process.cwd(), 'backups', 'latest_backup.json');
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    console.log('📊 Dados encontrados no backup:');
    console.log(`- Atendentes: ${backupData.database.attendants.length}`);
    console.log(`- Vendas: ${backupData.database.sales.length}`);
    console.log(`- Metas: ${backupData.database.goals?.length || 0}`);
    console.log(`- Conquistas: ${backupData.database.achievements?.length || 0}`);
    console.log(`- Notificações: ${backupData.database.notifications?.length || 0}`);
    console.log(`- Admins: ${backupData.database.admins?.length || 0}`);
    
    // Testar conexão
    console.log('🔌 Testando conexão com Supabase...');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida:', result.rows[0]);
    
    // Verificar se as tabelas existem
    console.log('🔍 Verificando estrutura das tabelas...');
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `);
    console.log('📋 Tabelas encontradas:', tables.rows.map(r => r.table_name));
    
    // Limpar tabelas existentes (cuidado!)
    console.log('🧹 Limpando tabelas existentes...');
    await pool.query('TRUNCATE TABLE notifications, achievements, goals, sales, attendants, admins RESTART IDENTITY CASCADE');
    
    // Migrar atendentes
    if (backupData.database.attendants.length > 0) {
      console.log('👥 Migrando atendentes...');
      for (const attendant of backupData.database.attendants) {
        await pool.query(`
          INSERT INTO attendants (id, name, image_url, earnings) 
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            image_url = EXCLUDED.image_url,
            earnings = EXCLUDED.earnings
        `, [attendant.id, attendant.name, attendant.imageUrl, attendant.earnings]);
      }
      console.log(`✅ ${backupData.database.attendants.length} atendentes migrados`);
    }
    
    // Migrar vendas
    if (backupData.database.sales.length > 0) {
      console.log('💰 Migrando vendas...');
      for (const sale of backupData.database.sales) {
        await pool.query(`
          INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (id) DO UPDATE SET
            attendant_id = EXCLUDED.attendant_id,
            value = EXCLUDED.value,
            client_name = EXCLUDED.client_name,
            client_phone = EXCLUDED.client_phone,
            client_email = EXCLUDED.client_email,
            created_at = EXCLUDED.created_at
        `, [
          sale.id, 
          sale.attendantId, 
          sale.value, 
          sale.clientName, 
          sale.clientPhone, 
          sale.clientEmail, 
          sale.createdAt
        ]);
      }
      console.log(`✅ ${backupData.database.sales.length} vendas migradas`);
    }
    
    // Migrar metas
    if (backupData.database.goals?.length > 0) {
      console.log('🎯 Migrando metas...');
      for (const goal of backupData.database.goals) {
        await pool.query(`
          INSERT INTO goals (id, attendant_id, title, description, target_value, current_value, goal_type, start_date, end_date, is_active, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            attendant_id = EXCLUDED.attendant_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            target_value = EXCLUDED.target_value,
            current_value = EXCLUDED.current_value,
            goal_type = EXCLUDED.goal_type,
            start_date = EXCLUDED.start_date,
            end_date = EXCLUDED.end_date,
            is_active = EXCLUDED.is_active,
            created_at = EXCLUDED.created_at
        `, [
          goal.id,
          goal.attendantId,
          goal.title,
          goal.description,
          goal.targetValue,
          goal.currentValue,
          goal.goalType,
          goal.startDate,
          goal.endDate,
          goal.isActive,
          goal.createdAt
        ]);
      }
      console.log(`✅ ${backupData.database.goals.length} metas migradas`);
    }
    
    // Migrar conquistas
    if (backupData.database.achievements?.length > 0) {
      console.log('🏆 Migrando conquistas...');
      for (const achievement of backupData.database.achievements) {
        await pool.query(`
          INSERT INTO achievements (id, attendant_id, title, description, achieved_at, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            attendant_id = EXCLUDED.attendant_id,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            achieved_at = EXCLUDED.achieved_at,
            created_at = EXCLUDED.created_at
        `, [
          achievement.id,
          achievement.attendantId,
          achievement.title,
          achievement.description,
          achievement.achievedAt,
          achievement.createdAt
        ]);
      }
      console.log(`✅ ${backupData.database.achievements.length} conquistas migradas`);
    }
    
    // Migrar notificações
    if (backupData.database.notifications?.length > 0) {
      console.log('🔔 Migrando notificações...');
      for (const notification of backupData.database.notifications) {
        await pool.query(`
          INSERT INTO notifications (id, title, message, type, is_read, created_at) 
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            message = EXCLUDED.message,
            type = EXCLUDED.type,
            is_read = EXCLUDED.is_read,
            created_at = EXCLUDED.created_at
        `, [
          notification.id,
          notification.title,
          notification.message,
          notification.type,
          notification.isRead,
          notification.createdAt
        ]);
      }
      console.log(`✅ ${backupData.database.notifications.length} notificações migradas`);
    }
    
    // Migrar admins
    if (backupData.database.admins?.length > 0) {
      console.log('👤 Migrando administradores...');
      for (const admin of backupData.database.admins) {
        await pool.query(`
          INSERT INTO admins (id, username, password, email, role, is_active, created_by, created_at, updated_at) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (id) DO UPDATE SET
            username = EXCLUDED.username,
            password = EXCLUDED.password,
            email = EXCLUDED.email,
            role = EXCLUDED.role,
            is_active = EXCLUDED.is_active,
            created_by = EXCLUDED.created_by,
            created_at = EXCLUDED.created_at,
            updated_at = EXCLUDED.updated_at
        `, [
          admin.id,
          admin.username,
          admin.password,
          admin.email,
          admin.role,
          admin.isActive,
          admin.createdBy,
          admin.createdAt,
          admin.updatedAt
        ]);
      }
      console.log(`✅ ${backupData.database.admins.length} administradores migrados`);
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    
    // Verificar dados migrados
    console.log('📊 Verificando dados migrados...');
    const attendantsCount = await pool.query('SELECT COUNT(*) FROM attendants');
    const salesCount = await pool.query('SELECT COUNT(*) FROM sales');
    const goalsCount = await pool.query('SELECT COUNT(*) FROM goals');
    const achievementsCount = await pool.query('SELECT COUNT(*) FROM achievements');
    const notificationsCount = await pool.query('SELECT COUNT(*) FROM notifications');
    const adminsCount = await pool.query('SELECT COUNT(*) FROM admins');
    
    console.log(`✅ Verificação final:`);
    console.log(`- Atendentes: ${attendantsCount.rows[0].count}`);
    console.log(`- Vendas: ${salesCount.rows[0].count}`);
    console.log(`- Metas: ${goalsCount.rows[0].count}`);
    console.log(`- Conquistas: ${achievementsCount.rows[0].count}`);
    console.log(`- Notificações: ${notificationsCount.rows[0].count}`);
    console.log(`- Admins: ${adminsCount.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar migração
migrateData();
