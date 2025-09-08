import 'dotenv/config';
import fs from 'fs';
import path from 'path';

// Função para criar um arquivo SQL com os dados para importação manual
async function createManualMigrationSQL() {
  try {
    console.log('🔄 Criando arquivo SQL para migração manual...');
    
    // Verificar se existe backup
    const backupPath = path.join(process.cwd(), 'backups', 'latest_backup.json');
    
    if (!fs.existsSync(backupPath)) {
      console.log('❌ Arquivo de backup não encontrado em:', backupPath);
      return;
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
    
    // Criar arquivo SQL
    let sqlContent = `-- Migração Manual para Supabase
-- Execute este script no SQL Editor do Supabase após criar as tabelas

-- Limpar dados existentes (cuidado!)
TRUNCATE TABLE notifications, achievements, goals, sales, attendants, admins RESTART IDENTITY CASCADE;

`;

    // Migrar atendentes
    if (backupData.database.attendants.length > 0) {
      sqlContent += `-- Inserir atendentes\n`;
      for (const attendant of backupData.database.attendants) {
        sqlContent += `INSERT INTO attendants (id, name, image_url, earnings) VALUES ('${attendant.id}', '${attendant.name.replace(/'/g, "''")}', ${attendant.imageUrl ? `'${attendant.imageUrl}'` : 'NULL'}, ${attendant.earnings});\n`;
      }
      sqlContent += `\n`;
    }
    
    // Migrar vendas
    if (backupData.database.sales.length > 0) {
      sqlContent += `-- Inserir vendas\n`;
      for (const sale of backupData.database.sales) {
        sqlContent += `INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('${sale.id}', '${sale.attendantId}', ${sale.value}, ${sale.clientName ? `'${sale.clientName.replace(/'/g, "''")}'` : 'NULL'}, ${sale.clientPhone ? `'${sale.clientPhone}'` : 'NULL'}, ${sale.clientEmail ? `'${sale.clientEmail}'` : 'NULL'}, '${sale.createdAt}');\n`;
      }
      sqlContent += `\n`;
    }
    
    // Migrar metas
    if (backupData.database.goals?.length > 0) {
      sqlContent += `-- Inserir metas\n`;
      for (const goal of backupData.database.goals) {
        sqlContent += `INSERT INTO goals (id, attendant_id, title, description, target_value, current_value, goal_type, start_date, end_date, is_active, created_at) VALUES ('${goal.id}', '${goal.attendantId}', '${goal.title.replace(/'/g, "''")}', ${goal.description ? `'${goal.description.replace(/'/g, "''")}'` : 'NULL'}, ${goal.targetValue}, ${goal.currentValue}, '${goal.goalType}', '${goal.startDate}', '${goal.endDate}', ${goal.isActive}, '${goal.createdAt}');\n`;
      }
      sqlContent += `\n`;
    }
    
    // Migrar conquistas
    if (backupData.database.achievements?.length > 0) {
      sqlContent += `-- Inserir conquistas\n`;
      for (const achievement of backupData.database.achievements) {
        sqlContent += `INSERT INTO achievements (id, attendant_id, title, description, achieved_at, created_at) VALUES ('${achievement.id}', '${achievement.attendantId}', '${achievement.title.replace(/'/g, "''")}', ${achievement.description ? `'${achievement.description.replace(/'/g, "''")}'` : 'NULL'}, '${achievement.achievedAt}', '${achievement.createdAt}');\n`;
      }
      sqlContent += `\n`;
    }
    
    // Migrar notificações
    if (backupData.database.notifications?.length > 0) {
      sqlContent += `-- Inserir notificações\n`;
      for (const notification of backupData.database.notifications) {
        sqlContent += `INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('${notification.id}', '${notification.title.replace(/'/g, "''")}', '${notification.message.replace(/'/g, "''")}', '${notification.type}', ${notification.isRead}, '${notification.createdAt}');\n`;
      }
      sqlContent += `\n`;
    }
    
    // Migrar admins
    if (backupData.database.admins?.length > 0) {
      sqlContent += `-- Inserir administradores\n`;
      for (const admin of backupData.database.admins) {
        sqlContent += `INSERT INTO admins (id, username, password, email, role, is_active, created_by, created_at, updated_at) VALUES ('${admin.id}', '${admin.username}', '${admin.password}', ${admin.email ? `'${admin.email}'` : 'NULL'}, '${admin.role}', ${admin.isActive}, ${admin.createdBy ? `'${admin.createdBy}'` : 'NULL'}, '${admin.createdAt}', '${admin.updatedAt}');\n`;
      }
      sqlContent += `\n`;
    }
    
    sqlContent += `-- Verificar dados inseridos
SELECT 'Atendentes' as tabela, COUNT(*) as total FROM attendants
UNION ALL
SELECT 'Vendas', COUNT(*) FROM sales
UNION ALL
SELECT 'Metas', COUNT(*) FROM goals
UNION ALL
SELECT 'Conquistas', COUNT(*) FROM achievements
UNION ALL
SELECT 'Notificações', COUNT(*) FROM notifications
UNION ALL
SELECT 'Admins', COUNT(*) FROM admins;
`;
    
    // Salvar arquivo SQL
    const sqlPath = path.join(process.cwd(), 'migracao-manual.sql');
    fs.writeFileSync(sqlPath, sqlContent);
    
    console.log('✅ Arquivo SQL criado com sucesso!');
    console.log('📁 Localização:', sqlPath);
    console.log('\n📋 PRÓXIMOS PASSOS:');
    console.log('==================');
    console.log('1. Acesse o painel do Supabase');
    console.log('2. Execute o script supabase-schema.sql primeiro');
    console.log('3. Execute o arquivo migracao-manual.sql');
    console.log('4. Verifique os dados no Table Editor');
    
  } catch (error) {
    console.error('❌ Erro ao criar migração manual:', error);
  }
}

// Executar
createManualMigrationSQL();
