/**
 * @swagger
 * components:
 *   schemas:
 *     Plano:
 *       type: object
 *       required:
 *         - nome
 *         - cargo
 *         - descricao
 *         - duracao
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do plano
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome do plano
 *           example: "Plano de Desenvolvimento Web"
 *         cargo:
 *           type: string
 *           description: Cargo/função do plano
 *           example: "Desenvolvedor Frontend"
 *         descricao:
 *           type: string
 *           description: Descrição do plano
 *           example: "Plano completo para desenvolvimento web frontend"
 *         duracao:
 *           type: integer
 *           description: Duração do plano em dias
 *           example: 90
 *         versao:
 *           type: string
 *           description: Versão do plano
 *           example: "1.0"
 *         ativo:
 *           type: boolean
 *           description: Status do plano
 *           example: true
 *         disciplinas:
 *           type: array
 *           description: Lista de disciplinas (atualmente sempre vazia)
 *           items:
 *             type: object
 *           example: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     PlanoRequest:
 *       type: object
 *       required:
 *         - nome
 *         - cargo
 *         - descricao
 *         - duracao
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do plano
 *           example: "Plano de Desenvolvimento Web"
 *         cargo:
 *           type: string
 *           description: Cargo/função do plano
 *           example: "Desenvolvedor Frontend"
 *         descricao:
 *           type: string
 *           description: Descrição do plano
 *           example: "Plano completo para desenvolvimento web frontend"
 *         duracao:
 *           type: integer
 *           description: Duração do plano em dias
 *           example: 90
 *         disciplinas:
 *           type: array
 *           description: Lista de disciplinas (atualmente ignorada na implementação)
 *           items:
 *             type: object
 *           example: []
 *
 *     PlanoResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Plano de Desenvolvimento Web"
 *         cargo:
 *           type: string
 *           example: "Desenvolvedor Frontend"
 *         descricao:
 *           type: string
 *           example: "Plano completo para desenvolvimento web frontend"
 *         duracao:
 *           type: integer
 *           example: 90
 *         versao:
 *           type: string
 *           example: "1.0"
 *         ativo:
 *           type: boolean
 *           example: true
 *         disciplinas:
 *           type: array
 *           description: Lista de disciplinas (atualmente sempre vazia)
 *           items:
 *             type: object
 *           example: []
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     PlanoListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Plano'
 *
 *     SprintTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Sprint 1 - Fundamentos HTML/CSS"
 *         PlanoId:
 *           type: integer
 *           description: ID do plano mestre
 *           example: 1
 *         posicao:
 *           type: integer
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         dataFim:
 *           type: string
 *           format: date
 *           example: "2024-01-29"
 *         metas:
 *           type: array
 *           description: Lista de metas da sprint
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               disciplina:
 *                 type: string
 *                 example: "HTML"
 *               tipo:
 *                 type: string
 *                 example: "teoria"
 *               titulo:
 *                 type: string
 *                 example: "Estrutura básica do HTML"
 *               comandos:
 *                 type: string
 *                 example: "Criar página HTML com estrutura básica"
 *               link:
 *                 type: string
 *                 example: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *               relevancia:
 *                 type: integer
 *                 example: 5
 *               tempoEstudado:
 *                 type: integer
 *                 example: 120
 *               desempenho:
 *                 type: number
 *                 example: 85.5
 *               status:
 *                 type: string
 *                 example: "concluida"
 *               totalQuestoes:
 *                 type: integer
 *                 example: 10
 *               questoesCorretas:
 *                 type: integer
 *                 example: 8
 *               SprintId:
 *                 type: integer
 *                 example: 1
 *               posicao:
 *                 type: integer
 *                 example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     Disciplina:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "HTML/CSS"
 *         descricao:
 *           type: string
 *           example: "Fundamentos de HTML e CSS"
 *         ativo:
 *           type: boolean
 *           example: true
 *
 *     SprintInstancia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Sprint 1 - Fundamentos HTML/CSS"
 *         PlanoId:
 *           type: integer
 *           description: ID do plano
 *           example: 1
 *         posicao:
 *           type: integer
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         dataFim:
 *           type: string
 *           format: date
 *           example: "2024-01-29"
 *         status:
 *           type: string
 *           description: Status da sprint instanciada
 *           example: "em_andamento"
 *         progresso:
 *           type: number
 *           description: Progresso da sprint em porcentagem
 *           example: 75.5

 *     DeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Item removido com sucesso"
 */

module.exports = {};
