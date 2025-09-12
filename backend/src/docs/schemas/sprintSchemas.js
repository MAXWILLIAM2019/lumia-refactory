/**
 * @swagger
 * components:
 *   schemas:
 *     SprintMestre:
 *       type: object
 *       required:
 *         - nome
 *         - PlanoId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da sprint mestre
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome da sprint
 *           example: "Sprint 1 - Fundamentos HTML/CSS"
 *         PlanoId:
 *           type: integer
 *           description: ID do plano mestre associado
 *           example: 1
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
 *         metas:
 *           type: array
 *           description: Lista de metas da sprint
 *           items:
 *             $ref: '#/components/schemas/MetaMestre'
 *         Plano:
 *           type: object
 *           description: Dados do plano associado
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Plano de Desenvolvimento Web"
 *             cargo:
 *               type: string
 *               example: "Desenvolvedor Frontend"
 *             duracao:
 *               type: integer
 *               example: 90
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     SprintMestreRequest:
 *       type: object
 *       required:
 *         - nome
 *         - planoId
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da sprint
 *           example: "Sprint 1 - Fundamentos HTML/CSS"
 *         planoId:
 *           type: integer
 *           description: ID do plano mestre associado
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
 *         metas:
 *           type: array
 *           description: Lista de metas da sprint
 *           items:
 *             $ref: '#/components/schemas/MetaMestreRequest'
 *
 *     SprintMestreResponse:
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
 *           items:
 *             $ref: '#/components/schemas/MetaMestre'
 *         Plano:
 *           type: object
 *           description: Dados do plano associado
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Plano de Desenvolvimento Web"
 *             cargo:
 *               type: string
 *               example: "Desenvolvedor Frontend"
 *             duracao:
 *               type: integer
 *               example: 90
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     SprintMestreListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/SprintMestre'
 *
 *     MetaMestre:
 *       type: object
 *       required:
 *         - disciplina
 *         - tipo
 *         - titulo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da meta mestre
 *           example: 1
 *         disciplina:
 *           type: string
 *           description: Nome da disciplina
 *           example: "HTML"
 *         tipo:
 *           type: string
 *           description: Tipo da meta
 *           example: "teoria"
 *         titulo:
 *           type: string
 *           description: Título da meta
 *           example: "Estrutura básica do HTML"
 *         comandos:
 *           type: string
 *           description: Comandos ou instruções da meta
 *           example: "Criar página HTML com estrutura básica"
 *         link:
 *           type: string
 *           description: Link de referência da meta
 *           example: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *         relevancia:
 *           type: integer
 *           description: Relevância da meta (1-5)
 *           example: 5
 *         tempoEstudado:
 *           type: string
 *           description: Tempo estudado (formato HH:MM)
 *           example: "00:00"
 *         desempenho:
 *           type: number
 *           description: Desempenho na meta (0-100)
 *           example: 0
 *         status:
 *           type: string
 *           description: Status da meta
 *           example: "Pendente"
 *         totalQuestoes:
 *           type: integer
 *           description: Total de questões
 *           example: 0
 *         questoesCorretas:
 *           type: integer
 *           description: Questões corretas
 *           example: 0
 *         SprintId:
 *           type: integer
 *           description: ID da sprint mestre
 *           example: 1
 *         posicao:
 *           type: integer
 *           description: Posição da meta na sprint
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     MetaMestreRequest:
 *       type: object
 *       required:
 *         - disciplina
 *         - tipo
 *         - titulo
 *       properties:
 *         disciplina:
 *           type: string
 *           description: Nome da disciplina
 *           example: "HTML"
 *         tipo:
 *           type: string
 *           description: Tipo da meta
 *           example: "teoria"
 *         titulo:
 *           type: string
 *           description: Título da meta
 *           example: "Estrutura básica do HTML"
 *         comandos:
 *           type: string
 *           description: Comandos ou instruções da meta
 *           example: "Criar página HTML com estrutura básica"
 *         link:
 *           type: string
 *           description: Link de referência da meta
 *           example: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *         relevancia:
 *           type: integer
 *           description: Relevância da meta (1-5)
 *           example: 5
 *         tempoEstudado:
 *           type: string
 *           description: Tempo estudado (formato HH:MM)
 *           example: "00:00"
 *         desempenho:
 *           type: number
 *           description: Desempenho na meta (0-100)
 *           example: 0
 *         status:
 *           type: string
 *           description: Status da meta
 *           example: "Pendente"
 *         totalQuestoes:
 *           type: integer
 *           description: Total de questões
 *           example: 0
 *         questoesCorretas:
 *           type: integer
 *           description: Questões corretas
 *           example: 0
 *         posicao:
 *           type: integer
 *           description: Posição da meta na sprint
 *           example: 1
 *
 *     ReordenarSprintsRequest:
 *       type: object
 *       required:
 *         - sprints
 *       properties:
 *         sprints:
 *           type: array
 *           description: Lista de sprints com novas posições
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1
 *               posicao:
 *                 type: integer
 *                 example: 1
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
 *         metas:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MetaInstancia'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     MetaInstancia:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         disciplina:
 *           type: string
 *           example: "HTML"
 *         tipo:
 *           type: string
 *           example: "teoria"
 *         titulo:
 *           type: string
 *           example: "Estrutura básica do HTML"
 *         comandos:
 *           type: string
 *           description: Comandos ou instruções da meta
 *           example: "Criar página HTML com estrutura básica"
 *         link:
 *           type: string
 *           description: Link de referência da meta
 *           example: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *         relevancia:
 *           type: integer
 *           description: Relevância da meta (1-5)
 *           example: 5
 *         tempoEstudado:
 *           type: string
 *           description: Tempo estudado (formato HH:MM)
 *           example: "01:30"
 *         desempenho:
 *           type: number
 *           description: Desempenho na meta (0-100)
 *           example: 85.5
 *         status:
 *           type: string
 *           description: Status da meta
 *           example: "Em andamento"
 *         totalQuestoes:
 *           type: integer
 *           description: Total de questões
 *           example: 10
 *         questoesCorretas:
 *           type: integer
 *           description: Questões corretas
 *           example: 8
 *         SprintId:
 *           type: integer
 *           description: ID da sprint instanciada
 *           example: 1
 *         posicao:
 *           type: integer
 *           description: Posição da meta na sprint
 *           example: 1
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     MetaInstanciaUpdateRequest:
 *       type: object
 *       properties:
 *         tempoEstudado:
 *           type: string
 *           description: Tempo estudado (formato HH:MM)
 *           example: "02:30"
 *         desempenho:
 *           type: number
 *           description: Desempenho na meta (0-100)
 *           example: 85.5
 *         status:
 *           type: string
 *           description: Status da meta
 *           example: "Concluída"
 *         totalQuestoes:
 *           type: integer
 *           description: Total de questões
 *           example: 10
 *         questoesCorretas:
 *           type: integer
 *           description: Questões corretas
 *           example: 8
 */

module.exports = {};
