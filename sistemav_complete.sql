-- =====================================================
-- SISTEMA V - SCRIPT SQL COMPLETO
-- Sistema de Gestão de Vendas e Atendentes
-- =====================================================

-- Criar banco de dados (execute como superuser)
-- CREATE DATABASE sistemav;
-- \c sistemav;

-- =====================================================
-- 1. CRIAÇÃO DAS TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de atendentes
CREATE TABLE IF NOT EXISTS attendants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL REFERENCES attendants(id) ON DELETE CASCADE,
    value DECIMAL(10,2) NOT NULL CHECK (value > 0),
    client_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    role TEXT DEFAULT 'admin' NOT NULL CHECK (role IN ('admin', 'super_admin')),
    is_active INTEGER DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1)),
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    last_login TIMESTAMP
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL REFERENCES attendants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL CHECK (target_value > 0),
    current_value DECIMAL(10,2) DEFAULT 0.00 NOT NULL CHECK (current_value >= 0),
    goal_type TEXT NOT NULL CHECK (goal_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL CHECK (end_date > start_date),
    is_active INTEGER DEFAULT 1 NOT NULL CHECK (is_active IN (0, 1)),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL REFERENCES attendants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    badge_color TEXT DEFAULT '#10b981' NOT NULL,
    points_awarded INTEGER DEFAULT 0 NOT NULL CHECK (points_awarded >= 0),
    achieved_at TIMESTAMP DEFAULT NOW() NOT NULL,
    category TEXT DEFAULT 'general' NOT NULL
);

-- Tabela de ranking
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL REFERENCES attendants(id) ON DELETE CASCADE,
    total_points INTEGER DEFAULT 0 NOT NULL CHECK (total_points >= 0),
    current_streak INTEGER DEFAULT 0 NOT NULL CHECK (current_streak >= 0),
    best_streak INTEGER DEFAULT 0 NOT NULL CHECK (best_streak >= 0),
    rank INTEGER DEFAULT 0 NOT NULL CHECK (rank >= 0),
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
    UNIQUE(attendant_id)
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('sale', 'achievement', 'goal_progress', 'team_milestone', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    attendant_id INTEGER REFERENCES attendants(id) ON DELETE CASCADE,
    metadata JSONB,
    is_read INTEGER DEFAULT 0 NOT NULL CHECK (is_read IN (0, 1)),
    priority TEXT DEFAULT 'normal' NOT NULL CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    read_at TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id SERIAL PRIMARY KEY,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de backup
CREATE TABLE IF NOT EXISTS backups (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    created_by INTEGER REFERENCES admins(id),
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    status TEXT DEFAULT 'completed' NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- =====================================================
-- 2. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela sales
CREATE INDEX IF NOT EXISTS idx_sales_attendant_id ON sales(attendant_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_value ON sales(value);
CREATE INDEX IF NOT EXISTS idx_sales_client_name ON sales(client_name);

-- Índices para tabela goals
CREATE INDEX IF NOT EXISTS idx_goals_attendant_id ON goals(attendant_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_goals_goal_type ON goals(goal_type);
CREATE INDEX IF NOT EXISTS idx_goals_start_date ON goals(start_date);
CREATE INDEX IF NOT EXISTS idx_goals_end_date ON goals(end_date);

-- Índices para tabela achievements
CREATE INDEX IF NOT EXISTS idx_achievements_attendant_id ON achievements(attendant_id);
CREATE INDEX IF NOT EXISTS idx_achievements_achieved_at ON achievements(achieved_at);
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);

-- Índices para tabela leaderboard
CREATE INDEX IF NOT EXISTS idx_leaderboard_attendant_id ON leaderboard(attendant_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_total_points ON leaderboard(total_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);

-- Índices para tabela notifications
CREATE INDEX IF NOT EXISTS idx_notifications_attendant_id ON notifications(attendant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- =====================================================
-- 3. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar earnings do atendente
CREATE OR REPLACE FUNCTION update_attendant_earnings()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE attendants 
        SET earnings = earnings + NEW.value,
            updated_at = NOW()
        WHERE id = NEW.attendant_id;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE attendants 
        SET earnings = earnings - OLD.value + NEW.value,
            updated_at = NOW()
        WHERE id = NEW.attendant_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE attendants 
        SET earnings = earnings - OLD.value,
            updated_at = NOW()
        WHERE id = OLD.attendant_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar earnings automaticamente
DROP TRIGGER IF EXISTS trigger_update_attendant_earnings ON sales;
CREATE TRIGGER trigger_update_attendant_earnings
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_attendant_earnings();

-- Função para atualizar ranking
CREATE OR REPLACE FUNCTION update_leaderboard()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar ou inserir no leaderboard
    INSERT INTO leaderboard (attendant_id, total_points, current_streak, best_streak, rank, updated_at)
    VALUES (NEW.attendant_id, 0, 0, 0, 0, NOW())
    ON CONFLICT (attendant_id) DO NOTHING;
    
    -- Recalcular ranking
    WITH ranked_attendants AS (
        SELECT 
            a.id,
            COALESCE(SUM(s.value), 0) as total_earnings,
            ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(s.value), 0) DESC) as new_rank
        FROM attendants a
        LEFT JOIN sales s ON a.id = s.attendant_id
        WHERE a.is_active = 1
        GROUP BY a.id
    )
    UPDATE leaderboard l
    SET 
        total_points = ra.total_earnings::INTEGER,
        rank = ra.new_rank,
        updated_at = NOW()
    FROM ranked_attendants ra
    WHERE l.attendant_id = ra.id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar ranking
DROP TRIGGER IF EXISTS trigger_update_leaderboard ON sales;
CREATE TRIGGER trigger_update_leaderboard
    AFTER INSERT OR UPDATE OR DELETE ON sales
    FOR EACH ROW EXECUTE FUNCTION update_leaderboard();

-- Função para criar notificação de venda
CREATE OR REPLACE FUNCTION create_sale_notification()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notifications (type, title, message, attendant_id, priority, metadata)
    VALUES (
        'sale',
        'Nova Venda Realizada',
        'Venda de R$ ' || NEW.value || ' registrada com sucesso!',
        NEW.attendant_id,
        'normal',
        json_build_object('sale_id', NEW.id, 'value', NEW.value, 'client_name', NEW.client_name)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para notificação de venda
DROP TRIGGER IF EXISTS trigger_create_sale_notification ON sales;
CREATE TRIGGER trigger_create_sale_notification
    AFTER INSERT ON sales
    FOR EACH ROW EXECUTE FUNCTION create_sale_notification();

-- =====================================================
-- 4. VIEWS ÚTEIS
-- =====================================================

-- View para estatísticas dos atendentes
CREATE OR REPLACE VIEW attendant_stats AS
SELECT 
    a.id,
    a.name,
    a.image_url,
    a.earnings,
    COUNT(s.id) as total_sales,
    COALESCE(AVG(s.value), 0) as avg_sale_value,
    COALESCE(MAX(s.created_at), a.created_at) as last_sale,
    l.rank,
    l.total_points,
    l.current_streak,
    l.best_streak
FROM attendants a
LEFT JOIN sales s ON a.id = s.attendant_id
LEFT JOIN leaderboard l ON a.id = l.attendant_id
WHERE a.is_active = 1
GROUP BY a.id, a.name, a.image_url, a.earnings, a.created_at, l.rank, l.total_points, l.current_streak, l.best_streak;

-- View para vendas do mês atual
CREATE OR REPLACE VIEW monthly_sales AS
SELECT 
    a.name as attendant_name,
    s.value,
    s.client_name,
    s.created_at,
    EXTRACT(DAY FROM s.created_at) as day_of_month
FROM sales s
JOIN attendants a ON s.attendant_id = a.id
WHERE EXTRACT(MONTH FROM s.created_at) = EXTRACT(MONTH FROM NOW())
    AND EXTRACT(YEAR FROM s.created_at) = EXTRACT(YEAR FROM NOW())
ORDER BY s.created_at DESC;

-- View para metas ativas
CREATE OR REPLACE VIEW active_goals AS
SELECT 
    g.id,
    g.title,
    g.description,
    g.target_value,
    g.current_value,
    g.goal_type,
    g.start_date,
    g.end_date,
    ROUND((g.current_value / g.target_value) * 100, 2) as progress_percentage,
    a.name as attendant_name,
    CASE 
        WHEN g.current_value >= g.target_value THEN 'completed'
        WHEN g.end_date < NOW() THEN 'expired'
        ELSE 'active'
    END as status
FROM goals g
JOIN attendants a ON g.attendant_id = a.id
WHERE g.is_active = 1;

-- =====================================================
-- 5. DADOS INICIAIS
-- =====================================================

-- Inserir administrador padrão (senha: admin123)
INSERT INTO admins (username, password, email, role) 
VALUES (
    'admin', 
    '$2b$10$rQZ8K9L2mN3pO4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nP7qR8sT9uV', 
    'admin@sistemav.com', 
    'super_admin'
) ON CONFLICT (username) DO NOTHING;

-- Inserir atendentes de exemplo
INSERT INTO attendants (name, image_url, earnings) VALUES
('João Silva', 'https://via.placeholder.com/150/10b981/ffffff?text=JS', 0.00),
('Maria Santos', 'https://via.placeholder.com/150/3b82f6/ffffff?text=MS', 0.00),
('Pedro Costa', 'https://via.placeholder.com/150/f59e0b/ffffff?text=PC', 0.00),
('Ana Oliveira', 'https://via.placeholder.com/150/ef4444/ffffff?text=AO', 0.00),
('Carlos Lima', 'https://via.placeholder.com/150/8b5cf6/ffffff?text=CL', 0.00)
ON CONFLICT DO NOTHING;

-- Inserir vendas de exemplo
INSERT INTO sales (attendant_id, value, client_name, client_phone, client_email) VALUES
(1, 150.00, 'Cliente A', '(11) 99999-1111', 'clientea@email.com'),
(1, 200.50, 'Cliente B', '(11) 99999-2222', 'clienteb@email.com'),
(2, 300.00, 'Cliente C', '(11) 99999-3333', 'clientec@email.com'),
(2, 175.75, 'Cliente D', '(11) 99999-4444', 'cliented@email.com'),
(3, 250.00, 'Cliente E', '(11) 99999-5555', 'clientee@email.com'),
(3, 400.00, 'Cliente F', '(11) 99999-6666', 'clientef@email.com'),
(4, 120.00, 'Cliente G', '(11) 99999-7777', 'clienteg@email.com'),
(5, 350.00, 'Cliente H', '(11) 99999-8888', 'clienteh@email.com');

-- Inserir metas de exemplo
INSERT INTO goals (attendant_id, title, description, target_value, goal_type, start_date, end_date) VALUES
(1, 'Meta Mensal', 'Vender R$ 5000 este mês', 5000.00, 'monthly', 
 DATE_TRUNC('month', NOW()), DATE_TRUNC('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'),
(2, 'Meta Semanal', 'Vender R$ 1000 esta semana', 1000.00, 'weekly',
 DATE_TRUNC('week', NOW()), DATE_TRUNC('week', NOW()) + INTERVAL '1 week' - INTERVAL '1 day'),
(3, 'Meta Diária', 'Vender R$ 200 hoje', 200.00, 'daily',
 DATE_TRUNC('day', NOW()), DATE_TRUNC('day', NOW()) + INTERVAL '1 day' - INTERVAL '1 second');

-- Inserir conquistas de exemplo
INSERT INTO achievements (attendant_id, title, description, icon, badge_color, points_awarded, category) VALUES
(1, 'Primeira Venda', 'Realizou sua primeira venda no sistema', '🎉', '#10b981', 10, 'milestone'),
(2, 'Vendedor do Mês', 'Foi o melhor vendedor do mês', '🏆', '#f59e0b', 50, 'performance'),
(3, 'Meta Atingida', 'Atingiu sua meta mensal', '🎯', '#3b82f6', 25, 'goal');

-- Inserir configurações do sistema
INSERT INTO system_settings (key, value, description) VALUES
('app_name', 'SistemaV', 'Nome da aplicação'),
('app_version', '1.0.0', 'Versão da aplicação'),
('commission_rate', '0.05', 'Taxa de comissão padrão (5%)'),
('backup_frequency', 'daily', 'Frequência de backup automático'),
('notification_sound', 'true', 'Ativar som de notificações'),
('theme', 'light', 'Tema padrão da aplicação'),
('currency', 'BRL', 'Moeda padrão'),
('timezone', 'America/Sao_Paulo', 'Fuso horário padrão');

-- Inserir notificações de exemplo
INSERT INTO notifications (type, title, message, attendant_id, priority) VALUES
('system', 'Bem-vindo ao SistemaV', 'Sistema configurado com sucesso!', NULL, 'normal'),
('sale', 'Nova Venda', 'Venda de R$ 150,00 registrada', 1, 'normal'),
('achievement', 'Conquista Desbloqueada', 'Você ganhou a conquista "Primeira Venda"', 1, 'high');

-- =====================================================
-- 6. PERMISSÕES E SEGURANÇA
-- =====================================================

-- Criar usuário específico para a aplicação (opcional)
-- CREATE USER sistemav_user WITH PASSWORD 'sistemav_password';
-- GRANT CONNECT ON DATABASE sistemav TO sistemav_user;
-- GRANT USAGE ON SCHEMA public TO sistemav_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO sistemav_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO sistemav_user;

-- =====================================================
-- 7. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON DATABASE sistemav IS 'Sistema de Gestão de Vendas e Atendentes - SistemaV';
COMMENT ON TABLE attendants IS 'Tabela de atendentes/vendedores do sistema';
COMMENT ON TABLE sales IS 'Tabela de vendas realizadas pelos atendentes';
COMMENT ON TABLE admins IS 'Tabela de administradores do sistema';
COMMENT ON TABLE goals IS 'Tabela de metas dos atendentes';
COMMENT ON TABLE achievements IS 'Tabela de conquistas/achievements dos atendentes';
COMMENT ON TABLE leaderboard IS 'Tabela de ranking dos atendentes';
COMMENT ON TABLE notifications IS 'Tabela de notificações do sistema';
COMMENT ON TABLE system_settings IS 'Tabela de configurações do sistema';

-- =====================================================
-- 8. VERIFICAÇÕES FINAIS
-- =====================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN ('attendants', 'sales', 'admins', 'goals', 'achievements', 'leaderboard', 'notifications', 'system_settings', 'backups')
ORDER BY tablename;

-- Verificar dados iniciais
SELECT 'Admins' as tabela, COUNT(*) as registros FROM admins
UNION ALL
SELECT 'Atendentes', COUNT(*) FROM attendants
UNION ALL
SELECT 'Vendas', COUNT(*) FROM sales
UNION ALL
SELECT 'Metas', COUNT(*) FROM goals
UNION ALL
SELECT 'Conquistas', COUNT(*) FROM achievements
UNION ALL
SELECT 'Notificações', COUNT(*) FROM notifications
UNION ALL
SELECT 'Configurações', COUNT(*) FROM system_settings;

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================

-- Para executar este script:
-- 1. psql -U postgres
-- 2. CREATE DATABASE sistemav;
-- 3. \c sistemav;
-- 4. \i sistemav_complete.sql
-- 5. Configure a DATABASE_URL no .env

