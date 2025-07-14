
const bcrypt = require('bcrypt');

// Senha para SSH: replit123
const SSH_PASSWORD = 'replit123';

// Hash da senha para validação
const passwordHash = bcrypt.hashSync(SSH_PASSWORD, 10);

// Função para validar senha
function validatePassword(inputPassword) {
    return bcrypt.compareSync(inputPassword, passwordHash);
}

console.log('=== CONFIGURAÇÃO SSH ===');
console.log('Senha SSH configurada: replit123');
console.log('Hash gerado:', passwordHash);
console.log('=========================');

module.exports = {
    SSH_PASSWORD,
    validatePassword
};
