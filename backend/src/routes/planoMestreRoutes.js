const express = require('express');
const router = express.Router();
const planoMestreController = require('../controllers/planoMestreController');
const { auth, adminOnly } = require('../middleware');

/**
 * Rotas para gerenciamento de Planos Mestre
 * Todas as rotas requerem autenticação de administrador
 */

/**
 * @route   GET /api/planos-mestre
 * @desc    Lista todos os planos mestre ativos
 * @access  Privado (Admin)
 */
router.get('/', auth, adminOnly, planoMestreController.listarPlanosMestre);

/**
 * @route   GET /api/planos-mestre/:id
 * @desc    Busca um plano mestre específico por ID
 * @access  Privado (Admin)
 */
router.get('/:id', auth, adminOnly, planoMestreController.buscarPlanoMestrePorId);

/**
 * @route   POST /api/planos-mestre
 * @desc    Cria um novo plano mestre
 * @access  Privado (Admin)
 */
router.post('/', auth, adminOnly, planoMestreController.criarPlanoMestre);

/**
 * @route   POST /api/planos-mestre/criar-instancia
 * @desc    Cria uma instância personalizada de um plano mestre para um aluno
 * @access  Privado (Admin)
 */
router.post('/criar-instancia', auth, adminOnly, planoMestreController.criarInstancia);

module.exports = router; 