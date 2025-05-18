/**
 * Rotas para gerenciamento de disciplinas
 * 
 * Este arquivo define os endpoints da API relacionados às disciplinas.
 * Inclui rotas para o sistema de versionamento de disciplinas.
 */
const express = require('express');
const router = express.Router();
const disciplinaController = require('../controllers/disciplinaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @route   GET /api/disciplinas
 * @desc    Lista todas as disciplinas
 * @access  Privado (requer token)
 */
router.get('/', disciplinaController.listarDisciplinas);

/**
 * @route   GET /api/disciplinas/ativas
 * @desc    Lista apenas as disciplinas ativas
 * @access  Privado (requer token)
 */
router.get('/ativas', disciplinaController.listarDisciplinasAtivas);

/**
 * @route   GET /api/disciplinas/:id
 * @desc    Busca uma disciplina pelo ID
 * @access  Privado (requer token)
 */
router.get('/:id', disciplinaController.buscarDisciplina);

/**
 * @route   POST /api/disciplinas
 * @desc    Cria uma nova disciplina
 * @access  Privado (requer token)
 * @body    {nome, assuntos[]}
 */
router.post('/', disciplinaController.criarDisciplina);

/**
 * @route   PUT /api/disciplinas/:id
 * @desc    Atualiza uma disciplina existente
 * @access  Privado (requer token)
 * @body    {nome, assuntos[]}
 */
router.put('/:id', disciplinaController.atualizarDisciplina);

/**
 * @route   DELETE /api/disciplinas/:id
 * @desc    Remove uma disciplina
 * @access  Privado (requer token)
 */
router.delete('/:id', disciplinaController.removerDisciplina);

/**
 * @route   POST /api/disciplinas/:id/versoes
 * @desc    Cria uma nova versão de uma disciplina existente
 * @access  Privado (requer token)
 * @body    {nome, descricao, assuntos[], ativa, copiarAssuntos}
 */
router.post('/:id/versoes', disciplinaController.criarVersaoDisciplina);

/**
 * @route   GET /api/disciplinas/:id/versoes
 * @desc    Lista todas as versões de uma disciplina
 * @access  Privado (requer token)
 */
router.get('/:id/versoes', disciplinaController.listarVersoesDisciplina);

/**
 * @route   GET /api/disciplinas/comparar/:id1/:id2
 * @desc    Compara duas versões de uma disciplina
 * @access  Privado (requer token)
 */
router.get('/comparar/:id1/:id2', disciplinaController.compararVersoesDisciplina);

module.exports = router; 