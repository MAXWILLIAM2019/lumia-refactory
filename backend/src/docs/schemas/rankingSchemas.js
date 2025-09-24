/**
 * @swagger
 * components:
 *   schemas:
 *     RankingItem:
 *       type: object
 *       required:
 *         - posicao
 *         - nome_usuario
 *         - total_questoes
 *         - total_acertos
 *         - percentual_acerto
 *         - pontuacao_final
 *       properties:
 *         posicao:
 *           type: integer
 *           description: Posição do aluno no ranking
 *           example: 1
 *         nome_usuario:
 *           type: string
 *           description: Nome do usuário
 *           example: "João Silva Santos"
 *         total_questoes:
 *           type: integer
 *           description: Total de questões respondidas pelo usuário
 *           example: 25
 *         total_acertos:
 *           type: integer
 *           description: Total de acertos do usuário
 *           example: 20
 *         percentual_acerto:
 *           type: number
 *           format: float
 *           description: Percentual de acerto do usuário
 *           example: 80.00
 *         pontuacao_final:
 *           type: number
 *           format: float
 *           description: Pontuação final calculada para o ranking
 *           example: 85.50
 *
 *     RankingPagination:
 *       type: object
 *       required:
 *         - pagina
 *         - limite
 *         - total
 *         - totalPaginas
 *         - temProxima
 *         - temAnterior
 *       properties:
 *         pagina:
 *           type: integer
 *           description: Página atual
 *           example: 1
 *         limite:
 *           type: integer
 *           description: Número de itens por página
 *           example: 50
 *         total:
 *           type: integer
 *           description: Total de alunos no ranking
 *           example: 150
 *         totalPaginas:
 *           type: integer
 *           description: Total de páginas disponíveis
 *           example: 3
 *         temProxima:
 *           type: boolean
 *           description: Indica se existe próxima página
 *           example: true
 *         temAnterior:
 *           type: boolean
 *           description: Indica se existe página anterior
 *           example: false
 *
 *     RankingWeek:
 *       type: object
 *       required:
 *         - inicio
 *         - fim
 *       properties:
 *         inicio:
 *           type: string
 *           format: date
 *           description: Data de início da semana do ranking (segunda-feira)
 *           example: "2024-01-15"
 *         fim:
 *           type: string
 *           format: date
 *           description: Data de fim da semana do ranking (domingo)
 *           example: "2024-01-21"
 *
 *     RankingResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *           example: true
 *         message:
 *           type: string
 *           description: Mensagem descritiva da operação
 *           example: "Ranking carregado com sucesso!"
 *         data:
 *           type: object
 *           required:
 *             - ranking
 *             - paginacao
 *             - semana
 *           properties:
 *             ranking:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RankingItem'
 *               description: Lista de alunos no ranking
 *             paginacao:
 *               $ref: '#/components/schemas/RankingPagination'
 *             semana:
 *               $ref: '#/components/schemas/RankingWeek'
 *
 *     MeuRankingData:
 *       type: object
 *       required:
 *         - posicao
 *         - semana
 *       properties:
 *         posicao:
 *           $ref: '#/components/schemas/RankingItem'
 *           description: Dados da posição do usuário no ranking
 *         semana:
 *           $ref: '#/components/schemas/RankingWeek'
 *
 *     MeuRankingResponse:
 *       type: object
 *       required:
 *         - success
 *         - data
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *           example: true
 *         data:
 *           oneOf:
 *             - $ref: '#/components/schemas/MeuRankingData'
 *             - type: "null"
 *           description: Dados do ranking do usuário ou null se não estiver no ranking
 *         message:
 *           type: string
 *           description: Mensagem descritiva (apenas quando data é null)
 *           example: "Usuário não encontrado no ranking desta semana"
 *
 *     RankingErrorResponse:
 *       type: object
 *       required:
 *         - success
 *         - message
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica se a operação foi bem-sucedida
 *           example: false
 *         message:
 *           type: string
 *           description: Mensagem de erro
 *           example: "Erro interno do servidor"
 *         error:
 *           type: string
 *           description: Detalhes técnicos do erro (opcional)
 *           example: "Database connection failed"
 *
 *     RankingQueryParams:
 *       type: object
 *       properties:
 *         limite:
 *           type: integer
 *           description: Número de itens por página (padrão: 50)
 *           example: 25
 *           minimum: 1
 *           maximum: 100
 *         pagina:
 *           type: integer
 *           description: Número da página (padrão: 1)
 *           example: 1
 *           minimum: 1
 */

module.exports = {};

