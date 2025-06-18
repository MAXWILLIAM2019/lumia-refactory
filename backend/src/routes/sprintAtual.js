const express = require('express');
const router = express.Router();
const sprintAtualController = require('../controllers/sprintAtualController');
const { auth } = require('../middleware/auth');

/**
 * @route   GET /api/sprint-atual
 * @desc    Busca a sprint atual do aluno
 * @access  Privado
 */
router.get('/', auth, sprintAtualController.getSprintAtual);

/**
 * @route   PUT /api/sprint-atual
 * @desc    Atualiza a sprint atual do aluno
 * @access  Privado
 */
router.put('/', auth, sprintAtualController.atualizarSprintAtual);

module.exports = router; 