/**
 * @swagger
 * components:
 *   schemas:
 *     SprintAtual:
 *       type: object
 *       required:
 *         - idusuario
 *         - SprintId
 *       properties:
 *         idusuario:
 *           type: integer
 *           description: ID do usuário/aluno
 *           example: 1
 *         SprintId:
 *           type: integer
 *           description: ID da sprint atual do aluno
 *           example: 1
 *         dataAtualizacao:
 *           type: string
 *           format: date-time
 *           description: Data da última atualização da sprint atual
 *           example: "2024-01-15T10:30:00.000Z"
 *         Sprint:
 *           type: object
 *           description: Dados completos da sprint atual
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Sprint 1 - HTML/CSS"
 *             posicao:
 *               type: integer
 *               example: 1
 *             dataInicio:
 *               type: string
 *               format: date
 *               example: "2024-01-15"
 *             dataFim:
 *               type: string
 *               format: date
 *               example: "2024-01-29"
 *             PlanoId:
 *               type: integer
 *               example: 1
 *             metas:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MetaInstancia'
 *
 *     SprintAtualResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID da sprint atual
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome da sprint atual
 *           example: "Sprint 1 - HTML/CSS"
 *         posicao:
 *           type: integer
 *           description: Posição da sprint no plano
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           description: Data de início da sprint
 *           example: "2024-01-15"
 *         dataFim:
 *           type: string
 *           format: date
 *           description: Data de fim da sprint
 *           example: "2024-01-29"
 *         PlanoId:
 *           type: integer
 *           description: ID do plano ao qual a sprint pertence
 *           example: 1
 *         metas:
 *           type: array
 *           description: Lista de metas da sprint atual
 *           items:
 *             $ref: '#/components/schemas/MetaInstancia'
 *           example:
 *             - id: 1
 *               disciplina: "HTML"
 *               tipo: "Teórica"
 *               titulo: "Introdução ao HTML"
 *               comandos: "Estudar tags básicas"
 *               link: "https://example.com/html-basics"
 *               relevancia: "Alta"
 *               tempoEstudado: "02:30"
 *               desempenho: 85
 *               status: "Concluída"
 *               totalQuestoes: 10
 *               questoesCorretas: 8
 *               SprintId: 1
 *             - id: 2
 *               disciplina: "CSS"
 *               tipo: "Prática"
 *               titulo: "Estilização com CSS"
 *               comandos: "Criar folha de estilos"
 *               link: "https://example.com/css-basics"
 *               relevancia: "Alta"
 *               tempoEstudado: "01:45"
 *               desempenho: 0
 *               status: "Pendente"
 *               totalQuestoes: 0
 *               questoesCorretas: 0
 *               SprintId: 1
 *
 *     SprintAtualUpdateRequest:
 *       type: object
 *       required:
 *         - sprintId
 *       properties:
 *         sprintId:
 *           type: integer
 *           description: ID da nova sprint atual
 *           example: 2
 *
 *     SprintAtualUpdateResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 2
 *         nome:
 *           type: string
 *           example: "Sprint 2 - JavaScript"
 *         posicao:
 *           type: integer
 *           example: 2
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: "2024-01-30"
 *         dataFim:
 *           type: string
 *           format: date
 *           example: "2024-02-13"
 *         PlanoId:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           example: "Ativa"
 *         metas:
 *           type: array
 *           items:
 *             allOf:
 *               - $ref: '#/components/schemas/MetaInstancia'
 *               - type: object
 *                 properties:
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-01-15T10:30:00.000Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 */

module.exports = {};
