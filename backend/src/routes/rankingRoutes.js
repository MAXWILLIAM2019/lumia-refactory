const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     RankingItem:
 *       type: object
 *       properties:
 *         posicao:
 *           type: integer
 *           description: Posição no ranking
 *           example: 1
 *         nome_usuario:
 *           type: string
 *           description: Nome do usuário
 *           example: "João Silva"
 *         total_questoes:
 *           type: integer
 *           description: Total de questões respondidas
 *           example: 25
 *         total_acertos:
 *           type: integer
 *           description: Total de acertos
 *           example: 20
 *         percentual_acerto:
 *           type: number
 *           format: float
 *           description: Percentual de acerto
 *           example: 80.00
 *         pontuacao_final:
 *           type: number
 *           format: float
 *           description: Pontuação final calculada
 *           example: 205.50
 *         ultima_atualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização
 *           example: "2024-01-15T14:30:00Z"
 *     
 *     RankingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             ranking:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RankingItem'
 *             paginacao:
 *               type: object
 *               properties:
 *                 pagina:
 *                   type: integer
 *                   example: 1
 *                 limite:
 *                   type: integer
 *                   example: 50
 *                 total:
 *                   type: integer
 *                   example: 150
 *                 totalPaginas:
 *                   type: integer
 *                   example: 3
 *                 temProxima:
 *                   type: boolean
 *                   example: true
 *                 temAnterior:
 *                   type: boolean
 *                   example: false
 *             semana:
 *               type: object
 *               properties:
 *                 inicio:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-15"
 *                 fim:
 *                   type: string
 *                   format: date
 *                   example: "2024-01-21"
 *     
 *     EstatisticasRanking:
 *       type: object
 *       properties:
 *         totalAlunos:
 *           type: integer
 *           example: 150
 *         pontuacaoMedia:
 *           type: string
 *           example: "125.50"
 *         pontuacaoMaxima:
 *           type: string
 *           example: "250.00"
 *         pontuacaoMinima:
 *           type: string
 *           example: "45.20"
 *         totalQuestoes:
 *           type: integer
 *           example: 3750
 *         totalAcertos:
 *           type: integer
 *           example: 3000
 *         percentualGeralAcerto:
 *           type: string
 *           example: "80.00"
 */

/**
 * @swagger
 * /api/ranking:
 *   get:
 *     summary: Obter ranking semanal global
 *     description: Retorna o ranking semanal de todos os alunos baseado em acertos e quantidade de questões
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limite
 *         schema:
 *           type: integer
 *           default: 50
 *           maximum: 100
 *         description: Número máximo de alunos no ranking
 *       - in: query
 *         name: pagina
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número da página para paginação
 *     responses:
 *       200:
 *         description: Ranking obtido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RankingResponse'
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro interno do servidor"
 */
router.get('/', auth, rankingController.obterRanking);

/**
 * @swagger
 * /api/ranking/meu-ranking:
 *   get:
 *     summary: Obter posição do usuário logado
 *     description: Retorna a posição do usuário logado no ranking semanal
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Posição obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     posicao:
 *                       $ref: '#/components/schemas/RankingItem'
 *                     semana:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-15"
 *                         fim:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-21"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro interno do servidor"
 */
router.get('/meu-ranking', auth, rankingController.obterMeuRanking);

/**
 * @swagger
 * /api/ranking/usuario/{id}:
 *   get:
 *     summary: Obter posição de um usuário específico
 *     description: Retorna a posição de um usuário específico no ranking semanal
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do usuário
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Posição obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     posicao:
 *                       $ref: '#/components/schemas/RankingItem'
 *                     semana:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-15"
 *                         fim:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-21"
 *       400:
 *         description: ID do usuário inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "ID do usuário inválido"
 *       404:
 *         description: Usuário não encontrado no ranking
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Usuário não encontrado no ranking desta semana"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro interno do servidor"
 */
router.get('/usuario/:id', auth, rankingController.obterPosicaoUsuario);

/**
 * @swagger
 * /api/ranking/estatisticas:
 *   get:
 *     summary: Obter estatísticas do ranking
 *     description: Retorna estatísticas gerais do ranking semanal
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     estatisticas:
 *                       $ref: '#/components/schemas/EstatisticasRanking'
 *                     semana:
 *                       type: object
 *                       properties:
 *                         inicio:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-15"
 *                         fim:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-21"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro interno do servidor"
 */
router.get('/estatisticas', auth, rankingController.obterEstatisticas);

/**
 * @swagger
 * /api/ranking/atualizar:
 *   post:
 *     summary: Forçar atualização do ranking
 *     description: Força a atualização do ranking semanal (apenas para administradores)
 *     tags: [Ranking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Ranking atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Ranking atualizado com sucesso"
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado. Apenas administradores podem forçar atualização"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar ranking"
 */
router.post('/atualizar', auth, rankingController.forcarAtualizacao);

module.exports = router;

