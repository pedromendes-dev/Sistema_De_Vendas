# 📥 Como Baixar e Configurar o Sistema de Vendas

## 🎯 O que você vai conseguir

Um sistema completo de gestão de vendas gamificado, pronto para usar na sua empresa:
- Controle de vendedores e vendas
- Sistema de metas e recompensas
- Ranking de performance
- Painel administrativo completo
- Design profissional e responsivo

## 🚀 Instalação Rápida (5 minutos)

### Opção 1: GitHub (Recomendado)
```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/sistema-vendas.git
cd sistema-vendas

# 2. Instale dependências
npm install

# 3. Configure o banco de dados
# Crie um banco PostgreSQL (recomendo Neon.tech - gratuito)
# Copie a URL de conexão

# 4. Configure variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env e adicione sua DATABASE_URL

# 5. Execute o sistema
npm run dev
```

### Opção 2: Download ZIP
1. Baixe o arquivo ZIP do projeto
2. Extraia em uma pasta
3. Abra o terminal na pasta
4. Execute os comandos acima (a partir do passo 2)

## 🔧 Configuração do Banco de Dados

### Usando Neon.tech (Gratuito)
1. Acesse [neon.tech](https://neon.tech)
2. Crie uma conta
3. Crie um novo database
4. Copie a connection string
5. Cole no arquivo `.env`

### Usando outro PostgreSQL
Qualquer banco PostgreSQL funciona:
- Supabase
- Railway
- Heroku Postgres
- PostgreSQL local

## 🎮 Primeiro Acesso

Após instalar e executar:

1. **Acesse o sistema**: `http://localhost:5000`
2. **Login admin**: 
   - Usuário: `administrador`
   - Senha: `root123`
3. **Configure sua empresa** na aba "Configurações"
4. **Adicione vendedores** na aba "Atendentes"
5. **Comece a registrar vendas**

## 📱 Deploy na Internet

### Vercel (Recomendado - Gratuito)
1. Faça upload do projeto no GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte o repositório
4. Configure a variável `DATABASE_URL`
5. Clique em Deploy

**Documentação completa**: `DEPLOY_VERCEL.md`

## 🛠️ Personalização

### Sua Marca
- **Logo**: Configure na aba "Configurações"
- **Nome**: Mude o nome da empresa
- **Cores**: Personalize o tema
- **Moeda**: Configure R$, US$, etc.

### Funcionalidades
- **Metas**: Configure objetivos de vendas
- **Pontos**: Sistema de gamificação
- **Relatórios**: Acompanhe performance
- **Notificações**: Alertas em tempo real

## 📞 Precisa de Ajuda?

### Documentação
- `README.md` - Visão geral técnica
- `MIGRAÇÃO_COMPLETA.md` - Deploy detalhado
- `DEPLOY_VERCEL.md` - Deploy específico Vercel

### Problemas Comuns

**Erro de conexão com banco**
- Verifique se a `DATABASE_URL` está correta
- Confirme se o banco existe
- Teste a conexão

**Sistema não carrega**
- Execute `npm install` novamente
- Verifique se o Node.js está atualizado (versão 18+)
- Veja os logs no terminal

**Login não funciona**
- Use: `administrador` / `root123`
- Verifique se o banco está conectado
- Recomece o sistema

## ✅ Sistema Completo

Após configurar, você terá:
- ✅ Painel administrativo profissional
- ✅ Gestão completa de vendedores
- ✅ Sistema de metas e gamificação
- ✅ Relatórios em tempo real
- ✅ Design responsivo (mobile/desktop)
- ✅ Sistema de notificações
- ✅ Ranking de performance
- ✅ Configurações personalizáveis

## 🚀 Pronto para Produção

Este sistema está 100% pronto para uso comercial:
- Sem dados de demonstração
- Interface profissional
- Performance otimizada
- Segurança implementada
- Mobile first

---

**Desenvolvido em 2025 - Sistema Brasileiro de Vendas Gamificado**