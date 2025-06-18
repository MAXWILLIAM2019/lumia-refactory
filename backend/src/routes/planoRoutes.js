const express = require('express');
const router = express.Router();
const planoController = require('../controllers/planoController');
const sprintController = require('../controllers/sprintController');
const { auth, adminOnly } = require('../middleware/auth');

/**
 * ATENÇÃO: Este arquivo contém rotas específicas para diferentes módulos do sistema.
 * Algumas rotas são exclusivas para a interface do administrador e outras para a interface do aluno.
 * NÃO altere o comportamento das rotas sem consultar o time de desenvolvimento.
 */

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

/**
 * @route   GET /api/planos/test
 * @desc    Rota de teste para verificar se o módulo está funcionando
 * @access  Privado
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de plano funcionando!' });
});

/**
 * ATENÇÃO: Rotas utilizadas no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 */

/**
 * @route   GET /api/planos
 * @desc    Lista todos os planos
 * @access  Privado/Admin
 */
router.get('/', auth, adminOnly, planoController.listarPlanos);

/**
 * @route   POST /api/planos
 * @desc    Cria um novo plano
 * @access  Privado/Admin
 */
router.post('/', auth, adminOnly, planoController.criarPlano);

/**
 * @route   GET /api/planos/:id
 * @desc    Busca um plano específico
 * @access  Privado
 */
router.get('/:id', planoController.buscarPlanoPorId);

/**
 * @route   GET /api/planos/:id/disciplinas
 * @desc    Busca disciplinas de um plano específico
 * @access  Privado
 */
router.get('/:id/disciplinas', planoController.buscarDisciplinasPorPlano);

/**
 * @route   GET /api/planos/:id/sprints
 * @desc    Busca sprints de um plano específico (template)
 * @access  Privado/Admin
 */
router.get('/:id/sprints', auth, adminOnly, planoController.buscarSprintsPorPlano);

/**
 * @route   GET /api/planos/:id/sprints-instancia
 * @desc    Busca as sprints instanciadas de um plano específico
 * @access  Privado
 */
router.get('/:id/sprints-instancia', sprintController.buscarSprintsInstanciadasPorPlano);

/**
 * @route   PUT /api/planos/:id
 * @desc    Atualiza um plano
 * @access  Privado/Admin
 */
router.put('/:id', auth, adminOnly, planoController.atualizarPlano);

/**
 * @route   DELETE /api/planos/:id
 * @desc    Remove um plano
 * @access  Privado/Admin
 */
router.delete('/:id', auth, adminOnly, planoController.excluirPlano);

module.exports = router; 