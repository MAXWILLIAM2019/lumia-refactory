/**
 * Rotas para Gerenciamento de Alunos
 * 
 * Este módulo define todas as rotas relacionadas às operações de alunos,
 * seguindo padrões RESTful para as operações CRUD.
 * 
 * Inclui controle de permissões para proteção de recursos.
 */
const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const authController = require('../controllers/authController');
const { 
  auth, 
  adminOnly, 
  alunoOnly, 
  ownProfileOnly, 
  checkPermission,
  ownProfileOrAdmin
} = require('../middleware');

/**
 * @route   GET /api/alunos/test
 * @desc    Rota de teste para verificar se o módulo de alunos está funcionando
 * @access  Público
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de alunos funcionando!' });
});

/**
 * Rotas Públicas (não necessitam de autenticação)
 */

/**
 * @route   GET /api/alunos
 * @desc    Lista todos os alunos cadastrados
 * @access  Público
 */
router.get('/', alunoController.getAllAlunos);

/**
 * @route   POST /api/alunos
 * @desc    Cadastra um novo aluno
 * @access  Público/Admin
 * @body    {nome, email, cpf}
 */
router.post('/', alunoController.createAluno);

/**
 * Rotas Protegidas (necessitam de autenticação)
 */

/**
 * @route   GET /api/alunos/planos
 * @desc    Busca os planos do aluno logado
 * @access  Privado (apenas para o próprio aluno)
 */
router.get('/planos', auth, alunoOnly, alunoController.getAlunoPlanos);

/**
 * @route   GET /api/alunos/sprints
 * @desc    Busca as sprints do aluno logado
 * @access  Privado (apenas para o próprio aluno)
 */
router.get('/sprints', auth, alunoOnly, alunoController.getAlunoSprints);

/**
 * @route   GET /api/alunos/:id
 * @desc    Busca um aluno pelo ID (apenas admin ou o próprio aluno)
 * @access  Privado
 * @param   {id} ID do aluno
 */
router.get('/:id', auth, ownProfileOnly('id'), alunoController.getAlunoById);

/**
 * @route   PUT /api/alunos/:id
 * @desc    Atualiza os dados de um aluno (apenas admin ou o próprio aluno)
 * @access  Privado
 * @param   {id} ID do aluno
 * @body    {nome, email, cpf}
 */
router.put('/:id', auth, ownProfileOnly('id'), alunoController.updateAluno);

/**
 * @route   DELETE /api/alunos/:id
 * @desc    Remove um aluno do sistema (apenas admin)
 * @access  Privado/Admin
 * @param   {id} ID do aluno
 */
router.delete('/:id', auth, adminOnly, alunoController.deleteAluno);

/**
 * @route   POST /api/alunos/:id/definir-senha
 * @desc    Define uma senha para um aluno (apenas admin ou o próprio aluno)
 * @access  Privado
 * @param   {id} ID do aluno
 * @body    {senha} Nova senha do aluno
 */
router.post('/:id/definir-senha', auth, ownProfileOrAdmin('id'), alunoController.definirSenha);

/**
 * @route   POST /api/alunos/:id/gerar-senha
 * @desc    Gera uma senha aleatória para um aluno (apenas admin ou o próprio aluno)
 * @access  Privado
 * @param   {id} ID do aluno
 */
router.post('/:id/gerar-senha', auth, checkPermission('admin', 'ownProfile'), alunoController.gerarSenha);

module.exports = router; 