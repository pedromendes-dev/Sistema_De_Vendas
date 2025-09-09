# 🔧 Configuração de Variáveis de Ambiente no Vercel

## 📋 Variáveis Necessárias

Configure as seguintes variáveis de ambiente no painel do Vercel:

### **Backend (Server)**
```
SUPABASE_URL=https://wgxnnylsmfvzyhzubzjb.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM
NODE_ENV=production
PORT=5000
```

### **Frontend (Client)**
```
VITE_SUPABASE_URL=https://wgxnnylsmfvzyhzubzjb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndneG5ueWxzbWZ2enloenViempiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMjAzOTMsImV4cCI6MjA3Mjc5NjM5M30.evVEOaqpJ8qJVfQ0M1pALXzY3RVjeZ0dNBFNakqvzmM
```

## 🚀 Como Configurar no Vercel

1. **Acesse o painel do Vercel**
2. **Vá em Settings > Environment Variables**
3. **Adicione cada variável** com o valor correspondente
4. **Selecione os ambientes** (Production, Preview, Development)
5. **Clique em Save**

## ⚠️ Importante

- As variáveis `VITE_*` são expostas no frontend
- As variáveis sem `VITE_` são apenas para o backend
- Certifique-se de que todas estão configuradas antes do deploy
