const express = require('express');
const router = express.Router();
const {
  listarPlanos,
  buscarPlanoPorId,
  criarPlano,
  atualizarPlano,
  excluirPlano,
  testarRota
} = require('../controllers/planoController');

// Rota de teste
router.get('/test', testarRota);

// Listar todos os planos
router.get('/', listarPlanos);

// Criar um novo plano
router.post('/', criarPlano);

// Buscar um plano específico
router.get('/:id', buscarPlanoPorId);

// Atualizar um plano
router.put('/:id', atualizarPlano);

// Excluir um plano
router.delete('/:id', excluirPlano);

module.exports = router; 