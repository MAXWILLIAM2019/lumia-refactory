/**
 * Rotas para Gerenciamento de Alunos
 * 
 * Este módulo define todas as rotas relacionadas às operações de alunos,
 * seguindo padrões RESTful para as operações CRUD.
 */
const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');

/**
 * @route   GET /api/alunos/test
 * @desc    Rota de teste para verificar se o módulo de alunos está funcionando
 * @access  Público
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de alunos funcionando!' });
});

/**
 * @route   GET /api/alunos
 * @desc    Lista todos os alunos cadastrados
 * @access  Público
 */
router.get('/', alunoController.getAllAlunos);

/**
 * @route   POST /api/alunos
 * @desc    Cadastra um novo aluno
 * @access  Público
 * @body    {nome, email, cpf}
 */
router.post('/', alunoController.createAluno);

/**
 * @route   GET /api/alunos/:id
 * @desc    Busca um aluno pelo ID
 * @access  Público
 * @param   {id} ID do aluno
 */
router.get('/:id', alunoController.getAlunoById);

/**
 * @route   PUT /api/alunos/:id
 * @desc    Atualiza os dados de um aluno existente
 * @access  Público
 * @param   {id} ID do aluno
 * @body    {nome, email, cpf}
 */
router.put('/:id', alunoController.updateAluno);

/**
 * @route   DELETE /api/alunos/:id
 * @desc    Remove um aluno do sistema
 * @access  Público
 * @param   {id} ID do aluno
 */
router.delete('/:id', alunoController.deleteAluno);

module.exports = router; 