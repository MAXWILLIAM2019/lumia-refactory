const express = require('express');
const router = express.Router();
const alunoRoutes = require('./alunoRoutes');

// Rotas do aluno
router.use('/aluno', alunoRoutes);

module.exports = router; 