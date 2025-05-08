# Sistema de Mentoria - Frontend

Este é o frontend do Sistema de Mentoria, desenvolvido com React + Vite.

## Tecnologias Utilizadas

### Core
- [React](https://reactjs.org/) - Biblioteca JavaScript para construção de interfaces
- [Vite](https://vitejs.dev/) - Build tool e servidor de desenvolvimento
- [React Router](https://reactrouter.com/) - Roteamento da aplicação
- [Axios](https://axios-http.com/) - Cliente HTTP para requisições à API

### UI/UX
- [Tailwind CSS](https://tailwindcss.com/) - Framework CSS utilitário
- [Flowbite](https://flowbite.com/) - Componentes UI baseados em Tailwind
- [React Icons](https://react-icons.github.io/react-icons/) - Biblioteca de ícones

### Estado e Gerenciamento
- [React Context](https://reactjs.org/docs/context.html) - Gerenciamento de estado global
- [React Query](https://tanstack.com/query/latest) - Gerenciamento de estado do servidor e cache

## Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   │   ├── layout/    # Componentes de layout (Sidebar, Header, etc)
│   │   └── ui/        # Componentes de UI (Badge, Button, etc)
│   ├── pages/         # Páginas da aplicação
│   ├── services/      # Serviços de API
│   ├── styles/        # Estilos globais
│   ├── App.jsx        # Componente principal
│   └── main.jsx       # Ponto de entrada
```

## Endpoints da API

### Sprints
- `GET /api/sprints` - Listar todas as sprints
- `POST /api/sprints` - Criar nova sprint
- `GET /api/sprints/:id` - Buscar sprint por ID
- `PUT /api/sprints/:id` - Atualizar sprint
- `DELETE /api/sprints/:id` - Deletar sprint

### Alunos
- `GET /api/alunos` - Listar todos os alunos
- `POST /api/alunos` - Criar novo aluno
- `GET /api/alunos/:id` - Buscar aluno por ID
- `PUT /api/alunos/:id` - Atualizar aluno
- `DELETE /api/alunos/:id` - Deletar aluno

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Visualiza build de produção localmente

## Configuração do Ambiente

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

3. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## Convenções de Código

- Componentes: PascalCase (ex: `Sidebar.jsx`)
- Funções: camelCase (ex: `handleSubmit`)
- Variáveis: camelCase (ex: `userData`)
- Constantes: UPPER_SNAKE_CASE (ex: `API_URL`)

## Troubleshooting

### Problemas Comuns

1. **Erro de CORS**
   - Verifique se o backend está rodando
   - Confirme se as URLs da API estão corretas no `.env`

2. **Erro de Build**
   - Limpe o cache: `npm run clean`
   - Reinstale as dependências: `npm install`

3. **Erro de Dependências**
   - Delete `node_modules` e `package-lock.json`
   - Execute `npm install` novamente
