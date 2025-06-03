const express = require('express');
const router = express.Router();
const sprintAtualController = require('../controllers/sprintAtualController');
const { auth } = require('../middleware');

// Aplicar middleware de autenticação em todas as rotas
router.use(auth);

// Buscar sprint atual do aluno
router.get('/', sprintAtualController.getSprintAtual);

// Atualizar sprint atual do aluno
router.put('/', sprintAtualController.atualizarSprintAtual);

module.exports = router; 