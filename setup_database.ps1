# Script PowerShell para configurar o banco PostgreSQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Configuracao do Banco PostgreSQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o PostgreSQL está instalado
Write-Host "Verificando se o PostgreSQL está instalado..." -ForegroundColor Yellow
try {
    $psqlVersion = psql --version
    Write-Host "PostgreSQL encontrado: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL não encontrado! Instale o PostgreSQL primeiro." -ForegroundColor Red
    Write-Host "Download: https://www.postgresql.org/download/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Passos para configurar o banco:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. Abra o terminal do PostgreSQL (psql) como superuser" -ForegroundColor White
Write-Host "   psql -U postgres" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Execute os comandos SQL:" -ForegroundColor White
Write-Host "   CREATE DATABASE sistemav;" -ForegroundColor Gray
Write-Host "   \c sistemav;" -ForegroundColor Gray
Write-Host "   \i $PWD\database_setup.sql" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Configure a DATABASE_URL no arquivo .env:" -ForegroundColor White
Write-Host "   DATABASE_URL=postgresql://postgres:sua_senha@localhost:5432/sistemav" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Execute o projeto:" -ForegroundColor White
Write-Host "   pnpm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "Arquivos criados:" -ForegroundColor Green
Write-Host "  - database_setup.sql (script SQL completo)" -ForegroundColor White
Write-Host "  - .env (configuração da conexão)" -ForegroundColor White
Write-Host ""

Read-Host "Pressione Enter para continuar"

