# Configuração do Supabase - SistemaV

## Como usar este script:

1. Edite este arquivo e substitua as credenciais abaixo
2. Execute: node update-supabase-config.js

## Credenciais do Supabase:

const newUrl = 'https://SEU-NOVO-PROJETO.supabase.co';
const newKey = 'SUA-NOVA-CHAVE-ANONIMA';

## Exemplo:
const newUrl = 'https://abcdefghijklmnop.supabase.co';
const newKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

## Depois de configurar, execute:
updateSupabaseConfig(newUrl, newKey);
