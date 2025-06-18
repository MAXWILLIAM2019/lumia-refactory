/**
 * Rotas para Gerenciamento de Associações Aluno-Plano
 * 
 * Este módulo define todas as rotas relacionadas às operações de associação entre alunos e planos,
 * seguindo padrões RESTful para as operações CRUD.
 */
const express = require('express');
const router = express.Router();
const alunoPlanoController = require('../controllers/alunoPlanoController');
const { auth } = require('../middleware/auth');

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

/**
 * @route   GET /api/aluno-plano/test
 * @desc    Rota de teste
 * @access  Público
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de aluno-plano funcionando!' });
});

/**
 * @route   GET /api/aluno-plano
 * @desc    Lista todas as associações entre alunos e planos
 * @access  Público
 */
router.get('/', alunoPlanoController.listarAssociacoes);

/**
 * @route   POST /api/aluno-plano
 * @desc    Atribui um plano a um aluno
 * @access  Público
 * @body    {alunoId, planoId, dataInicio, dataPrevisaoTermino, status, observacoes}
 */
router.post('/', alunoPlanoController.atribuirPlanoAluno);

/**
 * @route   GET /api/aluno-plano/meu-plano
 * @desc    Retorna o plano associado ao aluno logado
 * @access  Privado (aluno autenticado)
 */
router.get('/meu-plano', alunoPlanoController.buscarPlanoDoAlunoLogado);

/**
 * @route   GET /api/aluno-plano/aluno/:alunoId
 * @desc    Busca os planos associados a um aluno
 * @access  Público
 * @param   {alunoId} ID do aluno
 */
router.get('/aluno/:alunoId', alunoPlanoController.buscarPlanosPorAluno);

/**
 * @route   GET /api/aluno-plano/plano/:planoId
 * @desc    Busca os alunos associados a um plano
 * @access  Público
 * @param   {planoId} ID do plano
 */
router.get('/plano/:planoId', alunoPlanoController.buscarAlunosPorPlano);

/**
 * @route   GET /api/aluno-plano/:id
 * @desc    Busca uma associação aluno-plano específica
 * @access  Público
 */
router.get('/:id', alunoPlanoController.buscarAssociacaoPorId);

/**
 * @route   PUT /api/aluno-plano/:id
 * @desc    Atualiza o progresso de um aluno em um plano
 * @access  Público
 * @param   {id} ID da associação
 * @body    {progresso, status, dataConclusao, observacoes}
 */
router.put('/:id', alunoPlanoController.atualizarProgresso);

/**
 * @route   DELETE /api/aluno-plano/:id
 * @desc    Remove a associação entre um aluno e um plano
 * @access  Público
 * @param   {id} ID da associação
 */
router.delete('/:id', alunoPlanoController.removerAssociacao);

module.exports = router; 