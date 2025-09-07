# Script PowerShell para instalação completa do SistemaV
param(
    [string]$PostgresUser = "postgres",
    [string]$PostgresPassword = "",
    [string]$DatabaseName = "sistemav"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    INSTALACAO COMPLETA - SISTEMAV" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o PostgreSQL está instalado
Write-Host "Verificando PostgreSQL..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version
    Write-Host "✓ PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ PostgreSQL não encontrado!" -ForegroundColor Red
    Write-Host "Instale o PostgreSQL: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

# Verificar se o arquivo SQL existe
if (-not (Test-Path "sistemav_complete.sql")) {
    Write-Host "✗ Arquivo sistemav_complete.sql não encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Arquivo SQL encontrado" -ForegroundColor Green

# Configurar variáveis de ambiente para psql
$env:PGPASSWORD = $PostgresPassword

Write-Host ""
Write-Host "Criando banco de dados '$DatabaseName'..." -ForegroundColor Yellow

# Criar banco de dados
try {
    psql -U $PostgresUser -c "CREATE DATABASE $DatabaseName;" 2>$null
    Write-Host "✓ Banco de dados criado/verificado" -ForegroundColor Green
} catch {
    Write-Host "⚠ Banco pode já existir" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Executando script SQL completo..." -ForegroundColor Yellow

# Executar script SQL
try {
    psql -U $PostgresUser -d $DatabaseName -f sistemav_complete.sql
    Write-Host "✓ Script SQL executado com sucesso!" -ForegroundColor Green
} catch {
    Write-Host "✗ Erro ao executar script SQL" -ForegroundColor Red
    Write-Host "Verifique as credenciais do PostgreSQL" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "    INSTALACAO CONCLUIDA COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Configurações do banco:" -ForegroundColor White
Write-Host "  Banco: $DatabaseName" -ForegroundColor Gray
Write-Host "  Usuário: $PostgresUser" -ForegroundColor Gray
Write-Host "  Host: localhost" -ForegroundColor Gray
Write-Host "  Porta: 5432" -ForegroundColor Gray
Write-Host ""

Write-Host "Próximos passos:" -ForegroundColor White
Write-Host "1. Configure a DATABASE_URL no arquivo .env:" -ForegroundColor Yellow
Write-Host "   DATABASE_URL=postgresql://$PostgresUser`:$PostgresPassword@localhost:5432/$DatabaseName" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Execute o projeto:" -ForegroundColor Yellow
Write-Host "   pnpm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Tabelas criadas:" -ForegroundColor White
Write-Host "  ✓ attendants (atendentes)" -ForegroundColor Green
Write-Host "  ✓ sales (vendas)" -ForegroundColor Green
Write-Host "  ✓ admins (administradores)" -ForegroundColor Green
Write-Host "  ✓ goals (metas)" -ForegroundColor Green
Write-Host "  ✓ achievements (conquistas)" -ForegroundColor Green
Write-Host "  ✓ leaderboard (ranking)" -ForegroundColor Green
Write-Host "  ✓ notifications (notificações)" -ForegroundColor Green
Write-Host "  ✓ system_settings (configurações)" -ForegroundColor Green
Write-Host "  ✓ backups (backups)" -ForegroundColor Green
Write-Host ""

Write-Host "Dados iniciais inseridos:" -ForegroundColor White
Write-Host "  ✓ Admin padrão (admin/admin123)" -ForegroundColor Green
Write-Host "  ✓ 5 atendentes de exemplo" -ForegroundColor Green
Write-Host "  ✓ Vendas de exemplo" -ForegroundColor Green
Write-Host "  ✓ Metas de exemplo" -ForegroundColor Green
Write-Host "  ✓ Conquistas de exemplo" -ForegroundColor Green
Write-Host "  ✓ Configurações do sistema" -ForegroundColor Green
Write-Host ""

Read-Host "Pressione Enter para continuar"

