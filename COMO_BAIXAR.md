# 📥 Como Baixar e Migrar o Projeto

## 🎯 Passo 1: Baixar do Replit

### No Replit:
1. **Clique nos 3 pontinhos (⋮) no canto superior direito**
2. **Selecione "Download as ZIP"**
3. **Salve o arquivo no seu computador**
4. **Extraia o ZIP em uma pasta**

## 🚀 Passo 2: Preparar para GitHub

### No seu computador:
```bash
# Entrar na pasta extraída
cd nome-da-pasta-extraida

# Executar script de configuração
./setup-repo.sh
```

**OU fazer manualmente:**
```bash
# Inicializar Git
git init
git add .
git commit -m "Sistema de vendas - migração do Replit"
```

## 🌐 Passo 3: Subir para GitHub

1. **Criar repositório no GitHub** (https://github.com)
2. **Conectar e enviar:**
```bash
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git branch -M main
git push -u origin main
```

## ☁️ Passo 4: Deploy no Vercel

1. **Acessar** https://vercel.com
2. **Login com GitHub**
3. **New Project → Seu repositório**
4. **Configurar:**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Adicionar variável:**
   - `DATABASE_URL`: sua URL do PostgreSQL
6. **Deploy!**

## 📋 Checklist Final

- [ ] Projeto baixado do Replit
- [ ] Git configurado
- [ ] Repositório GitHub criado
- [ ] Código enviado para GitHub
- [ ] Deploy no Vercel configurado
- [ ] Banco de dados conectado
- [ ] Site funcionando no domínio

## 🔗 Links Úteis

- **Vercel**: https://vercel.com
- **Neon Database**: https://neon.tech
- **GitHub**: https://github.com

## 📞 Arquivos de Ajuda

- `MIGRAÇÃO_COMPLETA.md` - Tutorial detalhado
- `DEPLOY_VERCEL.md` - Guia específico do Vercel
- `setup-repo.sh` - Script automatizado
- `.env.example` - Exemplo de variáveis

## 🎉 Pronto!

Seu sistema estará rodando no seu próprio domínio!