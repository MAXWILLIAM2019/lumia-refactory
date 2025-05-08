require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const sprintRoutes = require('./routes/sprintRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const Aluno = require('./models/Aluno'); // Importar modelo para sincronização

const app = express();

// Configuração de middlewares
// CORS: Permite requisições de diferentes origens (frontend)
// express.json(): Permite o parsing de JSON no corpo das requisições
app.use(cors());
app.use(express.json());

// Rotas da API
// Todas as rotas relacionadas a sprints começam com /api/sprints
app.use('/api/sprints', sprintRoutes);
app.use('/api/alunos', alunoRoutes);

// Rota de teste para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API do Mentor está funcionando!' });
});

// Sincronização do banco de dados e inicialização do servidor
// sequelize.sync(): Cria as tabelas no banco se não existirem
sequelize.sync({ force: true }).then(() => {
  console.log('Banco de dados sincronizado!');
  console.log('Modelos disponíveis:', Object.keys(sequelize.models));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(error => {
  console.error('Erro ao sincronizar banco de dados:', error);
});

// Middleware de tratamento de erros
// Captura qualquer erro não tratado nas rotas
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ 
    message: 'Algo deu errado!',
    error: err.message
  });
}); 