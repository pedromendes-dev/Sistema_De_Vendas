# 🚀 Sistema de Vendas Gamificado

[![Deploy na Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/SEU_USUARIO/sistema-vendas-gamificado)

## 📋 Visão Geral

Sistema completo de gestão de vendas com gamificação, desenvolvido especialmente para empresas brasileiras. Interface moderna, responsiva e otimizada para mobile, com sistema de pontos, rankings e conquistas para motivar equipes de vendas.

## ✨ Funcionalidades Principais

### 🎯 Gestão de Vendas
- ✅ Registro rápido de vendas por vendedor
- ✅ Histórico completo de transações
- ✅ Cálculo automático de ganhos e comissões
- ✅ Relatórios em tempo real

### 🏆 Sistema de Gamificação
- ✅ Pontos por vendas realizadas
- ✅ Ranking de performance em tempo real
- ✅ Sistema de conquistas e badges
- ✅ Streaks de vendas consecutivas

### 👥 Gestão de Equipe
- ✅ Cadastro completo de vendedores
- ✅ Fotos de perfil e informações pessoais
- ✅ Controle de departamentos e hierarquia
- ✅ Métricas individuais de performance

### 🎮 Metas e Objetivos
- ✅ Criação de metas personalizadas
- ✅ Acompanhamento automático de progresso
- ✅ Notificações de conquistas
- ✅ Recompensas por objetivos atingidos

### 🔧 Painel Administrativo
- ✅ 8 seções completas de gerenciamento
- ✅ Configurações personalizáveis da empresa
- ✅ Controle de usuários administradores
- ✅ Sistema de notificações profissional

## 🚀 Instalação Rápida

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL (recomendamos [Neon.tech](https://neon.tech) - gratuito)

### Configuração Local
```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/sistema-vendas-gamificado.git
cd sistema-vendas-gamificado

# 2. Instale dependências
npm install

# 3. Configure o banco de dados
cp .env.example .env
# Edite .env e adicione sua DATABASE_URL

# 4. Execute o sistema
npm run dev
```

### Deploy na Vercel (Recomendado)
1. Faça fork deste repositório
2. Acesse [vercel.com](https://vercel.com)
3. Conecte seu repositório
4. Configure a variável `DATABASE_URL`
5. Clique em "Deploy"

**Documentação completa:** [`MIGRAÇÃO_COMPLETA.md`](./MIGRAÇÃO_COMPLETA.md)

## 🛠️ Tecnologias

### Frontend
- **React 18** - Interface moderna e reativa
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização responsiva
- **shadcn/ui** - Componentes profissionais
- **TanStack Query** - Gerenciamento de estado do servidor

### Backend
- **Express.js** - API REST robusta
- **PostgreSQL** - Banco de dados relacional
- **Drizzle ORM** - ORM type-safe
- **Zod** - Validação de dados

### Deploy
- **Vercel** - Hospedagem serverless
- **Neon Database** - PostgreSQL serverless
- **GitHub** - Controle de versão

## 📱 Interface Responsiva

O sistema foi desenvolvido com foco mobile-first:
- Design adaptativo para todos os dispositivos
- Touch gestures otimizados
- Performance superior em mobile
- PWA ready (Progressive Web App)

## 🔐 Acesso Administrativo

**Credenciais padrão:**
- **Usuário:** `administrador`
- **Senha:** `root123`

⚠️ **Importante:** Altere essas credenciais em produção

## 🔧 Configuração Avançada

### Personalização da Marca
- Logo da empresa
- Cores personalizadas
- Nome e dados da empresa
- Moeda padrão (R$, US$, EUR, etc.)

### Sistema de Pontos
- Pontos por venda configuráveis
- Multiplicadores por metas
- Bônus por streaks
- Penalizações opcionais

### Notificações
- Alertas em tempo real
- Configurações de som
- Push notifications (PWA)
- Email notifications (opcional)

## 📚 Documentação

- [`COMO_BAIXAR.md`](./COMO_BAIXAR.md) - Guia simples de instalação
- [`MIGRAÇÃO_COMPLETA.md`](./MIGRAÇÃO_COMPLETA.md) - Deploy detalhado
- [`DEPLOY_VERCEL.md`](./DEPLOY_VERCEL.md) - Configuração Vercel
- [`replit.md`](./replit.md) - Histórico de desenvolvimento

## 🚀 Scripts de Automação

### Configurar Repositório Git
```bash
./setup-repo.sh
```

### Preparar Deploy
```bash
./deploy.sh
```

## 🤝 Contribuição

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [`LICENSE`](./LICENSE) para mais detalhes.

## 🆘 Suporte

### Problemas Comuns
- **Erro de conexão:** Verifique a `DATABASE_URL`
- **Sistema não carrega:** Execute `npm install` novamente
- **Login falha:** Use `administrador` / `root123`

### Contato
- **Issues:** [GitHub Issues](https://github.com/SEU_USUARIO/sistema-vendas-gamificado/issues)
- **Documentação:** Arquivos `.md` na raiz do projeto
- **Deploy:** Siga [`MIGRAÇÃO_COMPLETA.md`](./MIGRAÇÃO_COMPLETA.md)

---

**Desenvolvido com ❤️ para empresas brasileiras**  
**2025 - Sistema de Vendas Gamificado**