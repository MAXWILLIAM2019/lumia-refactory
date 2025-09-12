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
 * @swagger
 * /api/planos/test:
 *   get:
 *     summary: Testar conexão do módulo de planos
 *     description: Endpoint de teste para verificar se o módulo de planos está funcionando corretamente
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Módulo funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rota de plano funcionando!"
 *             example:
 *               message: "Rota de plano funcionando!"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de plano funcionando!' });
});

/**
 * ATENÇÃO: Rotas utilizadas no módulo de administração (Cadastro de Planos)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 */

/**
 * @swagger
 * /api/planos:
 *   get:
 *     summary: Listar todos os planos (Admin)
 *     description: Retorna todos os planos mestre ativos do sistema. Apenas administradores podem acessar.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de planos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoListResponse'
 *             example:
 *               - id: 1
 *                 nome: "Plano de Desenvolvimento Web"
 *                 cargo: "Desenvolvedor Frontend"
 *                 descricao: "Plano completo para formação em desenvolvimento web frontend"
 *                 duracao: 90
 *                 versao: "1.0"
 *                 ativo: true
 *                 disciplinas: []
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               - id: 2
 *                 nome: "Plano de Desenvolvimento Backend"
 *                 cargo: "Desenvolvedor Backend"
 *                 descricao: "Plano focado em desenvolvimento backend com Node.js"
 *                 duracao: 120
 *                 versao: "1.0"
 *                 ativo: true
 *                 disciplinas: []
 *                 createdAt: "2024-01-20T14:15:00.000Z"
 *                 updatedAt: "2024-01-20T14:15:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem listar planos"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar planos"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/', auth, adminOnly, planoController.listarPlanos);

/**
 * @swagger
 * /api/planos:
 *   post:
 *     summary: Criar novo plano (Admin)
 *     description: Cria um novo plano mestre no sistema. Apenas administradores podem criar planos.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanoRequest'
 *           example:
 *             nome: "Plano de Desenvolvimento Web"
 *             cargo: "Desenvolvedor Frontend"
 *             descricao: "Plano completo para formação em desenvolvimento web frontend"
 *             duracao: 90
 *             disciplinas: []
 *     responses:
 *       201:
 *         description: Plano criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoResponse'
 *             example:
 *               id: 1
 *               nome: "Plano de Desenvolvimento Web"
 *               cargo: "Desenvolvedor Frontend"
 *               descricao: "Plano completo para formação em desenvolvimento web frontend"
 *               duracao: 90
 *               versao: "1.0"
 *               ativo: true
 *               disciplinas: []
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Todos os campos são obrigatórios"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem criar planos"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao criar plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.post('/', auth, adminOnly, planoController.criarPlano);

/**
 * @swagger
 * /api/planos/{id}:
 *   get:
 *     summary: Buscar plano por ID
 *     description: Retorna os detalhes de um plano mestre específico pelo seu ID.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Plano encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoResponse'
 *             example:
 *               id: 1
 *               nome: "Plano de Desenvolvimento Web"
 *               cargo: "Desenvolvedor Frontend"
 *               descricao: "Plano completo para formação em desenvolvimento web frontend"
 *               duracao: 90
 *               versao: "1.0"
 *               ativo: true
 *               disciplinas: []
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.get('/:id', planoController.buscarPlanoPorId);

/**
 * @swagger
 * /api/planos/{id}/disciplinas:
 *   get:
 *     summary: Buscar disciplinas do plano
 *     description: Retorna as disciplinas associadas a um plano mestre específico.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disciplinas do plano obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Disciplina'
 *             example:
 *               - id: 1
 *                 nome: "HTML/CSS"
 *                 descricao: "Fundamentos de HTML e CSS"
 *                 ativo: true
 *               - id: 2
 *                 nome: "JavaScript"
 *                 descricao: "Programação em JavaScript"
 *                 ativo: true
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar disciplinas do plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.get('/:id/disciplinas', planoController.buscarDisciplinasPorPlano);

/**
 * @swagger
 * /api/planos/{id}/sprints:
 *   get:
 *     summary: Buscar sprints do plano (Admin)
 *     description: Retorna as sprints mestre (templates) associadas a um plano mestre específico. Apenas administradores podem acessar.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sprints do plano obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SprintTemplate'
 *             example:
 *               - id: 1
 *                 nome: "Sprint 1 - Fundamentos HTML/CSS"
 *                 PlanoId: 1
 *                 posicao: 1
 *                 dataInicio: "2024-01-15"
 *                 dataFim: "2024-01-29"
 *                 metas:
 *                   - id: 1
 *                     disciplina: "HTML"
 *                     tipo: "teoria"
 *                     titulo: "Estrutura básica do HTML"
 *                     comandos: "Criar página HTML com estrutura básica"
 *                     link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                     relevancia: 5
 *                     tempoEstudado: 120
 *                     desempenho: 85.5
 *                     status: "concluida"
 *                     totalQuestoes: 10
 *                     questoesCorretas: 8
 *                     SprintId: 1
 *                     posicao: 1
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem acessar sprints do plano"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar sprints do plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.get('/:id/sprints', auth, adminOnly, planoController.buscarSprintsPorPlano);

/**
 * @swagger
 * /api/planos/{id}/sprints-instancia:
 *   get:
 *     summary: Buscar sprints instanciadas do plano
 *     description: Retorna as sprints instanciadas (em execução) de um plano específico.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sprints instanciadas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SprintInstancia'
 *             example:
 *               - id: 1
 *                 nome: "Sprint 1 - Fundamentos HTML/CSS"
 *                 PlanoId: 1
 *                 posicao: 1
 *                 dataInicio: "2024-01-15"
 *                 dataFim: "2024-01-29"
 *                 status: "em_andamento"
 *                 progresso: 75.5
 *               - id: 2
 *                 nome: "Sprint 2 - JavaScript Básico"
 *                 PlanoId: 1
 *                 posicao: 2
 *                 dataInicio: "2024-01-30"
 *                 dataFim: "2024-02-13"
 *                 status: "pendente"
 *                 progresso: 0
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar sprints instanciadas do plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.get('/:id/sprints-instancia', sprintController.buscarSprintsInstanciadasPorPlano);

/**
 * @swagger
 * /api/planos/{id}:
 *   put:
 *     summary: Atualizar plano (Admin)
 *     description: Atualiza os dados de um plano mestre existente. Apenas administradores podem atualizar planos.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PlanoRequest'
 *           example:
 *             nome: "Plano de Desenvolvimento Web Atualizado"
 *             cargo: "Desenvolvedor Frontend Sênior"
 *             descricao: "Plano completo e atualizado para formação em desenvolvimento web frontend"
 *             duracao: 120
 *             disciplinas: []
 *     responses:
 *       200:
 *         description: Plano atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PlanoResponse'
 *             example:
 *               id: 1
 *               nome: "Plano de Desenvolvimento Web Atualizado"
 *               cargo: "Desenvolvedor Frontend Sênior"
 *               descricao: "Plano completo e atualizado para formação em desenvolvimento web frontend"
 *               duracao: 120
 *               versao: "1.0"
 *               ativo: true
 *               disciplinas: []
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-20T15:45:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Todos os campos são obrigatórios"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem atualizar planos"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao atualizar plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.put('/:id', auth, adminOnly, planoController.atualizarPlano);

/**
 * @swagger
 * /api/planos/{id}:
 *   delete:
 *     summary: Excluir plano (Admin)
 *     description: Remove um plano mestre do sistema (soft delete - marca como inativo). Apenas administradores podem excluir planos.
 *     tags: [Planos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Plano excluído com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *             example:
 *               message: "Plano excluído com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem excluir planos"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao excluir plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.delete('/:id', auth, adminOnly, planoController.excluirPlano);

module.exports = router; 