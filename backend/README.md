# Backend do Sistema de Mentoria

## Descrição
Backend do sistema de mentoria desenvolvido com Node.js, Express e MongoDB.

## Tecnologias Utilizadas
- Node.js
- Express
- MongoDB
- Mongoose
- JWT (JSON Web Token)
- Bcrypt

## Dependências Principais
- express: ^4.18.2
- mongoose: ^8.0.3
- cors: ^2.8.5
- dotenv: ^16.3.1
- jsonwebtoken: ^9.0.2
- bcryptjs: ^2.4.3

## Configuração do Ambiente
1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione as seguintes variáveis:
     ```
     MONGODB_URI=sua_url_do_mongodb
     JWT_SECRET=seu_segredo_jwt
     PORT=3000
     ```

## Estrutura do Projeto
```
backend/
├── src/
│   ├── controllers/    # Controladores da aplicação
│   ├── models/         # Modelos do Mongoose
│   ├── routes/         # Rotas da API
│   ├── middleware/     # Middlewares
│   ├── services/       # Serviços
│   ├── utils/          # Utilitários
│   ├── app.js          # Configuração do Express
│   └── server.js       # Arquivo principal
├── .env               # Variáveis de ambiente
└── package.json       # Dependências e scripts
```

## Scripts Disponíveis
- `npm start`: Inicia o servidor
- `npm run dev`: Inicia o servidor em modo desenvolvimento
- `npm test`: Executa os testes

## Rotas da API
### Alunos
- `GET /api/alunos`: Lista todos os alunos
- `POST /api/alunos`: Cria um novo aluno
- `GET /api/alunos/:id`: Obtém um aluno específico
- `PUT /api/alunos/:id`: Atualiza um aluno
- `DELETE /api/alunos/:id`: Remove um aluno

### Planos de Estudo
- `GET /api/planos`: Lista todos os planos
- `POST /api/planos`: Cria um novo plano
- `GET /api/planos/:id`: Obtém um plano específico
- `PUT /api/planos/:id`: Atualiza um plano
- `DELETE /api/planos/:id`: Remove um plano

### Autenticação
- `POST /api/auth/login`: Login de administrador
- `POST /api/auth/register`: Registro de administrador
- `GET /api/auth/me`: Obtém dados do administrador logado

## Segurança
- Autenticação via JWT
- Senhas criptografadas com bcrypt
- Validação de dados
- Proteção contra ataques comuns

## Contribuição
1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença
Este projeto está sob a licença MIT. 