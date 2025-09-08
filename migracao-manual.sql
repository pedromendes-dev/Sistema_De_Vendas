-- Migração Manual para Supabase
-- Execute este script no SQL Editor do Supabase após criar as tabelas

-- Limpar dados existentes (cuidado!)
TRUNCATE TABLE notifications, achievements, goals, sales, attendants, admins RESTART IDENTITY CASCADE;

-- Inserir atendentes
INSERT INTO attendants (id, name, image_url, earnings) VALUES ('1', 'JoÃ£o Silva', 'https://via.placeholder.com/150/10b981/ffffff?text=JS', 350.50);
INSERT INTO attendants (id, name, image_url, earnings) VALUES ('2', 'Maria Santos', 'https://via.placeholder.com/150/3b82f6/ffffff?text=MS', 475.75);
INSERT INTO attendants (id, name, image_url, earnings) VALUES ('3', 'Pedro Costa', 'https://via.placeholder.com/150/f59e0b/ffffff?text=PC', 650.00);
INSERT INTO attendants (id, name, image_url, earnings) VALUES ('4', 'Ana Oliveira', 'https://via.placeholder.com/150/ef4444/ffffff?text=AO', 120.00);
INSERT INTO attendants (id, name, image_url, earnings) VALUES ('5', 'Carlos Lima', 'https://via.placeholder.com/150/8b5cf6/ffffff?text=CL', 350.00);

-- Inserir vendas
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('1', '1', 150.00, 'Cliente A', '(11) 99999-1111', 'clientea@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('2', '1', 200.50, 'Cliente B', '(11) 99999-2222', 'clienteb@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('3', '2', 300.00, 'Cliente C', '(11) 99999-3333', 'clientec@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('4', '2', 175.75, 'Cliente D', '(11) 99999-4444', 'cliented@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('5', '3', 250.00, 'Cliente E', '(11) 99999-5555', 'clientee@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('6', '3', 400.00, 'Cliente F', '(11) 99999-6666', 'clientef@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('7', '4', 120.00, 'Cliente G', '(11) 99999-7777', 'clienteg@email.com', '2025-09-06T19:21:08.990Z');
INSERT INTO sales (id, attendant_id, value, client_name, client_phone, client_email, created_at) VALUES ('8', '5', 350.00, 'Cliente H', '(11) 99999-8888', 'clienteh@email.com', '2025-09-06T19:21:08.990Z');

-- Inserir metas
INSERT INTO goals (id, attendant_id, title, description, target_value, current_value, goal_type, start_date, end_date, is_active, created_at) VALUES ('1', '1', 'Meta Mensal', 'Vender R$ 5000 este mÃªs', 5000.00, 0.00, 'monthly', '2025-09-01T00:00:00.000Z', '2025-09-30T00:00:00.000Z', 1, '2025-09-06T19:21:09.066Z');
INSERT INTO goals (id, attendant_id, title, description, target_value, current_value, goal_type, start_date, end_date, is_active, created_at) VALUES ('2', '2', 'Meta Semanal', 'Vender R$ 1000 esta semana', 1000.00, 0.00, 'weekly', '2025-09-01T00:00:00.000Z', '2025-09-07T00:00:00.000Z', 1, '2025-09-06T19:21:09.066Z');
INSERT INTO goals (id, attendant_id, title, description, target_value, current_value, goal_type, start_date, end_date, is_active, created_at) VALUES ('3', '3', 'Meta DiÃ¡ria', 'Vender R$ 200 hoje', 200.00, 0.00, 'daily', '2025-09-06T00:00:00.000Z', '2025-09-06T23:59:59.000Z', 1, '2025-09-06T19:21:09.066Z');

-- Inserir notificações
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('1', 'Nova Venda Realizada', 'Venda de R$ 150.00 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('2', 'Nova Venda Realizada', 'Venda de R$ 200.50 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('3', 'Nova Venda Realizada', 'Venda de R$ 300.00 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('4', 'Nova Venda Realizada', 'Venda de R$ 175.75 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('5', 'Nova Venda Realizada', 'Venda de R$ 250.00 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('6', 'Nova Venda Realizada', 'Venda de R$ 400.00 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('7', 'Nova Venda Realizada', 'Venda de R$ 120.00 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('8', 'Nova Venda Realizada', 'Venda de R$ 350.00 registrada com sucesso!', 'sale', 0, '2025-09-06T19:21:08.990Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('9', 'Bem-vindo ao SistemaV', 'Sistema configurado com sucesso!', 'system', 0, '2025-09-06T19:21:09.114Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('10', 'Nova Venda', 'Venda de R$ 150,00 registrada', 'sale', 0, '2025-09-06T19:21:09.114Z');
INSERT INTO notifications (id, title, message, type, is_read, created_at) VALUES ('11', 'Conquista Desbloqueada', 'VocÃª ganhou a conquista "Primeira Venda"', 'achievement', 0, '2025-09-06T19:21:09.114Z');

-- Inserir administradores
INSERT INTO admins (id, username, password, email, role, is_active, created_by, created_at, updated_at) VALUES ('1', 'admin', '[ENCRYPTED]', 'admin@sistemav.com', 'super_admin', 1, NULL, '2025-09-06T19:21:08.964Z', '2025-09-06T19:21:08.964Z');
INSERT INTO admins (id, username, password, email, role, is_active, created_by, created_at, updated_at) VALUES ('2', 'pedro', '[ENCRYPTED]', 'pedro@sistemav.com', 'admin', 1, NULL, '2025-09-06T19:41:58.018Z', '2025-09-06T19:41:58.018Z');

-- Verificar dados inseridos
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
