-- Script SQL para criar o banco de dados do SistemaV
-- Execute este script no PostgreSQL para criar todas as tabelas

-- Criar banco de dados (execute como superuser)
-- CREATE DATABASE sistemav;

-- Conectar ao banco sistemav
-- \c sistemav;

-- Tabela de atendentes
CREATE TABLE IF NOT EXISTS attendants (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    image_url TEXT NOT NULL,
    earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL
);

-- Tabela de vendas
CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    client_name TEXT,
    client_phone TEXT,
    client_email TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de administradores
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'admin' NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(10,2) NOT NULL,
    current_value DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    goal_type TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active INTEGER DEFAULT 1 NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT NOT NULL,
    badge_color TEXT DEFAULT '#10b981' NOT NULL,
    points_awarded INTEGER DEFAULT 0 NOT NULL,
    achieved_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de ranking
CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    attendant_id INTEGER NOT NULL,
    total_points INTEGER DEFAULT 0 NOT NULL,
    current_streak INTEGER DEFAULT 0 NOT NULL,
    best_streak INTEGER DEFAULT 0 NOT NULL,
    rank INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    attendant_id INTEGER,
    metadata TEXT,
    is_read INTEGER DEFAULT 0 NOT NULL,
    priority TEXT DEFAULT 'normal' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Inserir dados iniciais
-- Admin padrão (senha: admin123)
INSERT INTO admins (username, password, email, role) 
VALUES ('admin', '$2b$10$rQZ8K9L2mN3pO4qR5sT6uO7vW8xY9zA0bC1dE2fG3hI4jK5lM6nP7qR8sT9uV', 'admin@sistemav.com', 'super_admin')
ON CONFLICT (username) DO NOTHING;

-- Atendentes de exemplo
INSERT INTO attendants (name, image_url, earnings) VALUES
('João Silva', 'https://via.placeholder.com/150/10b981/ffffff?text=JS', 0.00),
('Maria Santos', 'https://via.placeholder.com/150/3b82f6/ffffff?text=MS', 0.00),
('Pedro Costa', 'https://via.placeholder.com/150/f59e0b/ffffff?text=PC', 0.00)
ON CONFLICT DO NOTHING;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_sales_attendant_id ON sales(attendant_id);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_goals_attendant_id ON goals(attendant_id);
CREATE INDEX IF NOT EXISTS idx_goals_is_active ON goals(is_active);
CREATE INDEX IF NOT EXISTS idx_achievements_attendant_id ON achievements(attendant_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_attendant_id ON leaderboard(attendant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_attendant_id ON notifications(attendant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

