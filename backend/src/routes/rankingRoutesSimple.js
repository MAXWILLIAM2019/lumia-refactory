const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/rankingControllerSimple');
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     ranking:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/RankingItem'
 *                     paginacao:
 *                       type: object
 *                       properties:
 *                         pagina:
 *                           type: integer
 *                           example: 1
 *                         limite:
 *                           type: integer
 *                           example: 50
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         totalPaginas:
 *                           type: integer
 *                           example: 3
 *                         temProxima:
 *                           type: boolean
 *                           example: true
 *                         temAnterior:
 *                           type: boolean
 *                           example: false
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

module.exports = router;

