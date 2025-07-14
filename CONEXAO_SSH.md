
# 🔐 Conexão SSH com Senha

## Credenciais SSH
- **Senha:** `replit123`
- **Usuário:** Seu username do Replit
- **Host:** `seu-repl.replit.dev`

## Como Conectar

### 1. Via Terminal
```bash
ssh seu-usuario@seu-repl.replit.dev
# Digite a senha quando solicitado: replit123
```

### 2. Via VS Code
1. Instale a extensão **Remote-SSH**
2. Pressione `Ctrl+Shift+P` (ou `Cmd+Shift+P` no Mac)
3. Digite "Remote-SSH: Connect to Host"
4. Digite: `seu-usuario@seu-repl.replit.dev`
5. Selecione "Linux" quando perguntado
6. Digite a senha: `replit123`

### 3. Via Terminal do VS Code
```bash
# No terminal integrado do VS Code
ssh seu-usuario@seu-repl.replit.dev
```

## Configuração Automática

Execute o script de configuração:
```bash
chmod +x setup-ssh-password.sh
./setup-ssh-password.sh
```

## Segurança

- A senha `replit123` é temporária
- Altere após a primeira conexão
- Use chaves SSH para maior segurança em produção

## Troubleshooting

Se der erro de "permission denied":
1. Verifique se o usuário está correto
2. Confirme se a senha está correta
3. Tente reconectar após alguns segundos
