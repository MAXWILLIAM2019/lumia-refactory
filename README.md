# Sistema de Mentoria

Um sistema completo para gerenciamento de mentorias, com funcionalidades para cadastro de alunos, sprints e atividades.

## Estrutura do Projeto

O projeto é dividido em duas partes principais:

- **Frontend**: Interface de usuário desenvolvida com React + Vite
- **Backend**: API RESTful desenvolvida com Node.js, Express e SQLite

## Tecnologias Principais

### Frontend
- React 18
- Vite
- React Router
- Axios
- React Quill (Editor de texto rico)

### Backend
- Node.js
- Express
- Sequelize (ORM)
- SQLite (Banco de dados)

## Instalação e Execução

### Requisitos Prévios
- Node.js (v14+)
- npm ou yarn

### Passos para Instalação

1. **Clone o repositório**
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd sis-mentoria
   ```

2. **Instale as dependências do backend**
   ```bash
   cd backend
   npm install
   ```

3. **Instale as dependências do frontend**
   ```bash
   cd ../frontend2
   npm install
   ```

4. **Inicie o backend**
   ```bash
   cd ../backend
   npm run dev
   ```

5. **Inicie o frontend (em outro terminal)**
   ```bash
   cd frontend2
   npm run dev
   ```

Após esses passos, o frontend estará disponível em `http://localhost:5173` e o backend em `http://localhost:3001`.

## Funcionalidades Principais

- Cadastro e gerenciamento de alunos
- Criação e edição de sprints
- Registro de atividades dentro das sprints
- Editor de texto avançado para conteúdo formatado

## Uso do Editor de Texto Rich Text

O sistema conta com um editor de texto avançado (React Quill) para o campo "Comandos" nas atividades das sprints.

### Como Acessar o Editor

1. No cadastro ou edição de uma sprint, localize o campo "Comandos" dentro de uma atividade
2. Clique no campo para abrir o modal do editor de texto
3. Use a barra de ferramentas para formatar seu conteúdo:
   - Negrito, itálico, sublinhado
   - Diferentes níveis de títulos
   - Listas ordenadas e não ordenadas
   - Links
   - Alinhamento de texto
   - Citações

### Como Salvar e Visualizar

1. Após editar seu conteúdo, clique em "Salvar" para aplicar as alterações
2. Uma prévia do conteúdo formatado será exibida no campo "Comandos"
3. O conteúdo formatado será armazenado e exibido corretamente nas visualizações da sprint

## Documentação Adicional

Para mais detalhes sobre cada parte do sistema, consulte:

- [Documentação do Frontend](./frontend2/README.md)
- [Documentação do Backend](./backend/README.md)

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença [INSERIR TIPO DE LICENÇA]. 