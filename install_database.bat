@echo off
echo ========================================
echo    INSTALACAO AUTOMATICA - SISTEMAV
echo ========================================
echo.

echo Verificando se o PostgreSQL esta instalado...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: PostgreSQL nao encontrado!
    echo Instale o PostgreSQL primeiro: https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo PostgreSQL encontrado!
echo.

echo Criando banco de dados...
psql -U postgres -c "CREATE DATABASE sistemav;" 2>nul
if %errorlevel% neq 0 (
    echo Aviso: Banco 'sistemav' pode ja existir
)

echo Executando script SQL completo...
psql -U postgres -d sistemav -f sistemav_complete.sql

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo    INSTALACAO CONCLUIDA COM SUCESSO!
    echo ========================================
    echo.
    echo Banco de dados: sistemav
    echo Usuario: postgres
    echo Senha: [sua senha do PostgreSQL]
    echo.
    echo Configure a DATABASE_URL no arquivo .env:
    echo DATABASE_URL=postgresql://postgres:SUA_SENHA@localhost:5432/sistemav
    echo.
    echo Execute: pnpm run dev
) else (
    echo.
    echo ========================================
    echo    ERRO NA INSTALACAO!
    echo ========================================
    echo.
    echo Verifique se:
    echo - PostgreSQL esta rodando
    echo - Usuario postgres tem permissoes
    echo - Arquivo sistemav_complete.sql existe
)

echo.
pause

