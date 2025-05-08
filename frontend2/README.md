# Sistema de Mentoria

Este é o frontend do Sistema de Mentoria, desenvolvido com React + Vite.

## Tecnologias Utilizadas

### Frontend
- **React**: Biblioteca JavaScript para construção de interfaces
- **Vite**: Build tool e servidor de desenvolvimento
- **React Router**: Gerenciamento de rotas
- **Tailwind CSS**: Framework CSS para estilização
- **Axios**: Cliente HTTP para requisições à API

### Backend
- **Node.js**: Runtime JavaScript
- **Express**: Framework web
- **Sequelize**: ORM para banco de dados
- **SQLite**: Banco de dados

## Estrutura do Projeto

### Frontend
```
frontend2/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API
│   ├── styles/        # Estilos globais
│   └── routes/        # Configuração de rotas
```

### Backend
```
backend/
└── mentor/
    └── src/
        ├── controllers/  # Controladores da aplicação
        ├── models/       # Modelos do Sequelize
        ├── routes/       # Rotas da API
        └── db.js         # Configuração do banco de dados
```

## Endpoints da API

### Alunos
- `GET /api/alunos` - Listar todos os alunos
- `POST /api/alunos` - Criar novo aluno
- `GET /api/alunos/:id` - Buscar aluno por ID
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

### Sprints
- `GET /api/sprints` - Listar todas as sprints
- `POST /api/sprints` - Criar nova sprint
- `GET /api/sprints/:id` - Buscar sprint por ID
- `PUT /api/sprints/:id` - Atualizar sprint
- `DELETE /api/sprints/:id` - Deletar sprint

## Como Executar

### Frontend
```bash
cd frontend2
npm install
npm run dev
```

### Backend
```bash
cd backend/mentor
npm install
npm start
```

## Desenvolvimento

- O frontend roda na porta 5173 por padrão
- O backend roda na porta 3000 por padrão
- O banco de dados SQLite é criado automaticamente na primeira execução

## Observações

- O projeto utiliza Sequelize como ORM para interação com o banco de dados
- As rotas da API seguem o padrão REST
- O frontend utiliza Tailwind CSS para estilização
- O sistema de rotas é gerenciado pelo React Router

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
