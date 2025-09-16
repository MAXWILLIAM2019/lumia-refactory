require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

console.log('=== INICIANDO SISTEMA DE MENTORIA (BACKEND) ===');
console.log('Ambiente:', process.env.NODE_ENV || 'desenvolvimento');

// Importação das rotas
console.log('\n1. Carregando módulos de rotas...');
const authRoutes = require('./routes/authRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const planoRoutes = require('./routes/planoRoutes');
const planoMestreRoutes = require('./routes/planoMestreRoutes');
const disciplinaRoutes = require('./routes/disciplinaRoutes');
const alunoPlanoRoutes = require('./routes/alunoPlanoRoutes');
const sprintRoutes = require('./routes/sprintRoutes');
const sprintAtualRoutes = require('./routes/sprintAtual');
const rankingRoutes = require('./routes/rankingRoutesTest2');
console.log('✓ Módulos de rotas carregados com sucesso');

// Carrega os modelos e seus relacionamentos
console.log('\n2. Carregando modelos e relacionamentos...');
require('./models');
console.log('✓ Modelos e relacionamentos carregados');

const app = express();

// Configuração de middlewares
console.log('\n3. Configurando middlewares...');
app.use(cors());
app.use(express.json());
console.log('✓ Middlewares configurados: CORS e JSON Parser');

// Configuração do Swagger
console.log('\n3.1. Configurando Swagger...');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sistema de Mentoria API',
      version: '1.0.0',
      description: 'API para gerenciamento de sistema de mentoria acadêmica',
      contact: {
        name: 'Equipe de Desenvolvimento',
        email: 'dev@mentoria.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Servidor de Desenvolvimento'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/docs/schemas/*.js', './src/index.js'] // Caminhos para arquivos com documentação
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
console.log('Schemas encontrados:', Object.keys(swaggerSpec.components?.schemas || {}));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
console.log('✓ Swagger configurado: http://localhost:3000/api-docs');

// Rotas da API
console.log('\n4. Configurando rotas da API...');
app.use('/api/sprints', sprintRoutes);
app.use('/api/alunos', alunoRoutes);
app.use('/api/planos', planoRoutes);
app.use('/api/planos-mestre', planoMestreRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/aluno-plano', alunoPlanoRoutes);
app.use('/api/sprint-atual', sprintAtualRoutes);
app.use('/api/ranking', rankingRoutes);
console.log('✓ Rotas configuradas:');
console.log('  - /api/sprints');
console.log('  - /api/alunos');
console.log('  - /api/planos');
console.log('  - /api/planos-mestre');
console.log('  - /api/auth');
console.log('  - /api/disciplinas');
console.log('  - /api/aluno-plano');
console.log('  - /api/sprint-atual');
console.log('  - /api/ranking');

// Rota básica de verificação
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema de Mentoria está funcionando!' });
});

// Sincronização do banco de dados e inicialização do servidor
console.log('\n5. Sincronizando banco de dados...');
sequelize.sync().then(() => {
  console.log('✓ Banco de dados sincronizado com sucesso');
  console.log('\n6. Informações do banco de dados:');
  console.log('Modelos registrados:', Object.keys(sequelize.models).join(', '));
  
  // Inicializa o agendador de jobs (comentado temporariamente)
  // console.log('\n7. Iniciando agendador de jobs...');
  // const scheduler = require('./jobs/scheduler');
  // scheduler.iniciar();
  // console.log('✓ Agendador de jobs iniciado');
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log('\n=== SISTEMA INICIADO COM SUCESSO ===');
    console.log(`Servidor rodando em: http://localhost:${PORT}`);
    console.log('Use Ctrl+C para encerrar\n');
  });
}).catch(error => {
  console.error('\n❌ ERRO AO INICIAR O SISTEMA:');
  console.error('Detalhes:', error.message);
  console.error('Stack:', error.stack);
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('\n❌ ERRO NÃO TRATADO:');
  console.error('URL:', req.url);
  console.error('Método:', req.method);
  console.error('Detalhes:', err.message);
  console.error('Stack:', err.stack);
  
  res.status(500).json({ 
    message: 'Erro interno do servidor',
    error: err.message
  });
}); 