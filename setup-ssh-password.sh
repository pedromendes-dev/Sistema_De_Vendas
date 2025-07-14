
#!/bin/bash

echo "🔐 Configurando SSH com senha..."

# Criar diretório SSH se não existir
mkdir -p ~/.ssh

# Configurar SSH para aceitar senha
echo "
Host *
    PasswordAuthentication yes
    PubkeyAuthentication yes
    PreferredAuthentications password,publickey
" >> ~/.ssh/config

# Definir permissões corretas
chmod 600 ~/.ssh/config
chmod 700 ~/.ssh

echo "✅ SSH configurado para aceitar senha!"
echo "🔑 Sua senha SSH é: replit123"
echo ""
echo "Para conectar via VS Code:"
echo "1. Use a extensão Remote-SSH"
echo "2. Conecte com: seu-usuario@seu-repl.replit.dev"
echo "3. Digite a senha: replit123"
