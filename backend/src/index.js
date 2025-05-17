require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const sprintRoutes = require('./routes/sprintRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const planoRoutes = require('./routes/planoRoutes');
const authRoutes = require('./routes/authRoutes');

// Importa os modelos
require('./models/Plano');
require('./models/Disciplina');
require('./models/Assunto');
require('./models/Administrador');
require('./models/Aluno');
require('./models/Meta'); // Importa o modelo Meta (antigo Atividade)

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
app.use('/api/planos', planoRoutes);
app.use('/api/auth', authRoutes);

// Rota para atualizar uma meta
app.put('/api/metas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tempoEstudado, desempenho, totalQuestoes, questoesCorretas } = req.body;
    
    // Busca a meta
    const meta = await sequelize.models.Meta.findByPk(id);
    if (!meta) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }
    
    // Atualiza a meta
    const dadosAtualizacao = { 
      status, 
      tempoEstudado, 
      desempenho 
    };
    
    // Adiciona campos opcionais se fornecidos
    if (totalQuestoes !== undefined) {
      dadosAtualizacao.totalQuestoes = totalQuestoes;
    }
    if (questoesCorretas !== undefined) {
      dadosAtualizacao.questoesCorretas = questoesCorretas;
    }
    
    await meta.update(dadosAtualizacao);
    
    // Retorna a meta atualizada
    res.json(meta);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(400).json({ message: error.message });
  }
});

// Rota de teste para verificar se a API está funcionando
app.get('/', (req, res) => {
  res.json({ message: 'API do Mentor está funcionando!' });
});

// Rota de teste para verificar se a API está funcionando
app.get('/api/test', (req, res) => {
  res.json({ message: 'API funcionando!' });
});

// Sincronização do banco de dados e inicialização do servidor
// IMPORTANTE: 'force: true' recria todas as tabelas e deve ser removido após a primeira execução
// isso é necessário para atualizar o modelo Meta com os novos campos: comandos, link, totalQuestoes e questoesCorretas
sequelize.sync({ force: true }).then(() => {
  console.log('Banco de dados sincronizado (tabelas recriadas)');
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