const express = require('express');
const router = express.Router();
const {
  listarPlanos,
  buscarPlanoPorId,
  criarPlano,
  atualizarPlano,
  excluirPlano,
  testarRota,
  buscarDisciplinasPorPlano,
  buscarSprintsPorPlano
} = require('../controllers/planoController');
const auth = require('../middleware/auth');

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

// Rota de teste
router.get('/test', testarRota);

// Listar todos os planos
router.get('/', listarPlanos);

// Criar um novo plano
router.post('/', criarPlano);

// Buscar um plano específico
router.get('/:id', buscarPlanoPorId);

// Buscar disciplinas de um plano específico
router.get('/:id/disciplinas', buscarDisciplinasPorPlano);

// Buscar sprints de um plano específico
router.get('/:id/sprints', buscarSprintsPorPlano);

// Atualizar um plano
router.put('/:id', atualizarPlano);

// Excluir um plano
router.delete('/:id', excluirPlano);

module.exports = router; 