# SalesControl - Sistema de Gestão de Vendas

Um sistema completo de gestão de vendas com controle de atendentes, metas, conquistas e relatórios em tempo real.

## 🚀 Funcionalidades

### ✨ Gestão de Vendas
- **Cadastro de Vendas**: Interface intuitiva para registro rápido de vendas
- **Controle de Atendentes**: Gerenciamento completo de equipe de vendas
- **Cálculo Automático**: Ganhos calculados automaticamente em tempo real
- **Histórico Completo**: Acompanhamento detalhado de todas as transações

### 🎯 Sistema de Metas
- **Metas Personalizadas**: Criação de metas individuais para cada atendente
- **Acompanhamento em Tempo Real**: Progresso das metas atualizado automaticamente
- **Períodos Flexíveis**: Metas diárias, semanais, mensais ou personalizadas
- **Notificações de Conquista**: Alertas automáticos quando metas são atingidas

### 🏆 Sistema de Conquistas
- **Badges de Progresso**: Sistema de conquistas com diferentes níveis
- **Gamificação**: Elementos que motivam a equipe de vendas
- **Ranking Dinâmico**: Classificação em tempo real dos melhores vendedores
- **Pontuação**: Sistema de pontos baseado em performance

### 📊 Dashboard e Relatórios
- **Dashboard Interativo**: Visão geral completa das vendas
- **Gráficos em Tempo Real**: Estatísticas visuais e dinâmicas
- **Relatórios Detalhados**: Análises profundas de performance
- **Exportação de Dados**: Relatórios em diversos formatos

### 🔧 Painel Administrativo
- **Gestão Completa**: Controle total do sistema
- **Configurações**: Personalização de parâmetros do sistema
- **Drag & Drop**: Interface de arrastar e soltar para organização
- **Layout Customizável**: Personalização da interface

### 📱 Mobile-First
- **Design Responsivo**: Otimizado para dispositivos móveis
- **Interface Nativa**: Experiência similar a aplicativos nativos
- **Touch Optimizado**: Gestos e interações otimizadas para touch
- **Animações Fluidas**: Transições suaves e modernas

## 🛠️ Tecnologias

### Frontend
- **React 18** com TypeScript
- **Vite** para build e desenvolvimento
- **Tailwind CSS** para estilização
- **shadcn/ui** para componentes
- **TanStack Query** para gerenciamento de estado
- **Wouter** para roteamento
- **React Hook Form** com validação Zod

### Backend
- **Express.js** com TypeScript
- **PostgreSQL** com Drizzle ORM
- **Neon Database** (serverless)
- **WebSockets** para atualizações em tempo real
- **Zod** para validação de dados

### DevOps & Deploy
- **Vercel** pronto para deploy
- **Docker** suporte opcional
- **GitHub Actions** para CI/CD
- **Environment Variables** configurado

## 🚀 Quick Start

### Pré-requisitos
- Node.js 18+ 
- PostgreSQL (ou usar Neon Database)
- Git

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/salescontrol.git
cd salescontrol
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
DATABASE_URL=sua_url_do_banco_postgresql
```

4. **Configure o banco de dados**
```bash
npm run db:push
```

5. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

6. **Acesse o sistema**
- URL: `http://localhost:5000`
- Admin: usuário `administrador`, senha `root123`

## 📁 Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── hooks/          # Hooks customizados
│   │   └── lib/            # Utilitários
│   └── public/             # Arquivos estáticos
├── server/                 # Backend Express
│   ├── routes.ts           # Rotas da API
│   ├── storage.ts          # Camada de dados
│   └── index.ts            # Servidor principal
├── shared/                 # Código compartilhado
│   └── schema.ts           # Esquemas do banco
└── docs/                   # Documentação
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Inicia servidor de desenvolvimento

# Build
npm run build           # Build para produção
npm run start           # Inicia servidor de produção

# Banco de dados
npm run db:push         # Aplica mudanças no schema
npm run db:studio       # Interface visual do banco

# Deploy
npm run deploy          # Deploy para Vercel
```

## 📊 Recursos Principais

### Sistema de Vendas
- Cadastro rápido de vendas por atendente
- Cálculo automático de comissões
- Histórico completo de transações
- Filtros e busca avançada

### Gestão de Equipe
- Cadastro de atendentes com foto
- Controle de status ativo/inativo
- Estatísticas individuais
- Rankings de performance

### Notificações Inteligentes
- Alertas de vendas em tempo real
- Notificações de metas atingidas
- Sistema de conquistas
- Centro de notificações moderno

### Interface Administrativa
- Painel completo de configurações
- Gestão de usuários e permissões
- Customização de layout
- Relatórios executivos

## 🚀 Deploy

### Vercel (Recomendado)

1. **Configure o projeto no Vercel**
```bash
npm i -g vercel
vercel
```

2. **Configure as variáveis de ambiente**
- `DATABASE_URL`: URL do banco PostgreSQL

3. **Deploy automático**
O deploy é feito automaticamente a cada push na branch `main`.

### Docker (Opcional)

```bash
# Build da imagem
docker build -t salescontrol .

# Executar container
docker run -p 5000:5000 -e DATABASE_URL=sua_url salescontrol
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Documentação**: [Wiki do Projeto](https://github.com/seu-usuario/salescontrol/wiki)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/salescontrol/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/salescontrol/discussions)

## 🎯 Roadmap

- [ ] Aplicativo móvel nativo
- [ ] Integração com WhatsApp
- [ ] Relatórios avançados
- [ ] Multi-empresas
- [ ] API pública
- [ ] Módulo financeiro

---

**SalesControl** - Transformando a gestão de vendas com tecnologia moderna e interface intuitiva.