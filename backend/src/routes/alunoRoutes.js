const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de alunos funcionando!' });
});

// Listar todos os alunos
router.get('/', alunoController.getAllAlunos);

// Criar novo aluno
router.post('/', alunoController.createAluno);

// Rotas para Aluno
router.get('/:id', alunoController.getAlunoById);
router.put('/:id', alunoController.updateAluno);
router.delete('/:id', alunoController.deleteAluno);

module.exports = router; 