const express = require('express');
const router = express.Router();

/**
 * ATENÇÃO: Este arquivo contém rotas específicas para diferentes módulos do sistema.
 * Algumas rotas são exclusivas para a interface do administrador e outras para a interface do aluno.
 * NÃO altere o comportamento das rotas sem consultar o time de desenvolvimento.
 */

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

const { buscarSprintsInstanciadasPorPlano } = require('../controllers/sprintController');

const auth = require('../middleware/auth');

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

// Rota de teste
router.get('/test', testarRota);

/**
 * ATENÇÃO: Rotas utilizadas no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 */

// Listar todos os planos mestre
router.get('/', listarPlanos);

// Criar um novo plano mestre
router.post('/', criarPlano);

// Buscar um plano mestre específico
router.get('/:id', buscarPlanoPorId);

// Buscar disciplinas de um plano mestre específico
router.get('/:id/disciplinas', buscarDisciplinasPorPlano);

// Buscar sprints de um plano mestre específico (template)
// ATENÇÃO: Rota utilizada apenas na interface do administrador para gerenciar templates
router.get('/:id/sprints', buscarSprintsPorPlano);

/**
 * ATENÇÃO: Rota utilizada no módulo do aluno (Visualização de Sprints)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * Esta rota retorna as sprints instanciadas (não os templates) de um plano específico
 */
router.get('/:id/sprints-instancia', buscarSprintsInstanciadasPorPlano);

// Atualizar um plano mestre
router.put('/:id', atualizarPlano);

// Excluir um plano mestre
router.delete('/:id', excluirPlano);

module.exports = router; 