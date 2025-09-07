@echo off
echo ========================================
echo    Configuracao do Banco PostgreSQL
echo ========================================
echo.

echo 1. Certifique-se de que o PostgreSQL esta instalado e rodando
echo 2. Execute os comandos abaixo no psql (terminal do PostgreSQL):
echo.

echo -- Criar banco de dados:
echo CREATE DATABASE sistemav;
echo.

echo -- Conectar ao banco:
echo \c sistemav;
echo.

echo -- Executar o script SQL:
echo \i database_setup.sql
echo.

echo 3. Configure a DATABASE_URL no arquivo .env:
echo DATABASE_URL=postgresql://seu_usuario:sua_senha@localhost:5432/sistemav
echo.

echo 4. Execute: pnpm run dev
echo.

pause

