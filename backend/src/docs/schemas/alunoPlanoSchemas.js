/**
 * @swagger
 * components:
 *   schemas:
 *     # NOTA IMPORTANTE: O modelo AlunoPlano usa CHAVE PRIMÁRIA COMPOSTA
 *     # (IdUsuario + PlanoId). Não existe um campo 'id' único.
 *     # Endpoints que tentam usar um campo 'id' único podem não funcionar corretamente.
 *     AlunoPlano:
 *       type: object
 *       required:
 *         - IdUsuario
 *         - PlanoId
 *         - dataInicio
 *       properties:
 *         IdUsuario:
 *           type: integer
 *           description: ID do usuário/aluno (chave primária composta)
 *           example: 1
 *         PlanoId:
 *           type: integer
 *           description: ID do plano associado (chave primária composta)
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           description: Data de início do plano para o aluno
 *           example: "2024-01-15"
 *         dataPrevisaoTermino:
 *           type: string
 *           format: date
 *           description: Data prevista para término do plano
 *           example: "2024-04-15"
 *         dataConclusao:
 *           type: string
 *           format: date
 *           description: Data efetiva de conclusão (null se não concluído)
 *           example: null
 *         progresso:
 *           type: integer
 *           description: Percentual de progresso no plano (0-100)
 *           example: 25
 *         status:
 *           type: string
 *           enum: [não iniciado, em andamento, concluído, cancelado]
 *           description: Status atual do progresso do aluno
 *           example: "em andamento"
 *         observacoes:
 *           type: string
 *           description: Observações adicionais sobre o progresso do aluno
 *           example: "Aluno com bom desempenho nas atividades práticas"
 *         ativo:
 *           type: boolean
 *           description: Indica se a associação está ativa
 *           example: true
 *         usuario:
 *           type: object
 *           description: Dados do usuário associado
 *           properties:
 *             idusuario:
 *               type: integer
 *               example: 1
 *             login:
 *               type: string
 *               example: "joao.silva@email.com"
 *         plano:
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
 *     AlunoPlanoRequest:
 *       type: object
 *       required:
 *         - idusuario
 *         - PlanoId
 *       properties:
 *         idusuario:
 *           type: integer
 *           description: ID do usuário/aluno
 *           example: 1
 *         PlanoId:
 *           type: integer
 *           description: ID do plano a ser associado
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           description: Data de início do plano (opcional)
 *           example: "2024-01-15"
 *         dataPrevisaoTermino:
 *           type: string
 *           format: date
 *           description: Data prevista para término (opcional)
 *           example: "2024-04-15"
 *         status:
 *           type: string
 *           enum: [não iniciado, em andamento, concluído, cancelado]
 *           description: Status inicial (opcional)
 *           example: "não iniciado"
 *         observacoes:
 *           type: string
 *           description: Observações iniciais (opcional)
 *           example: "Plano atribuído pelo administrador"
 *
 *     AlunoPlanoResponse:
 *       type: object
 *       properties:
 *         IdUsuario:
 *           type: integer
 *           example: 1
 *         PlanoId:
 *           type: integer
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           example: "2024-01-15"
 *         dataPrevisaoTermino:
 *           type: string
 *           format: date
 *           example: "2024-04-15"
 *         dataConclusao:
 *           type: string
 *           format: date
 *           example: null
 *         progresso:
 *           type: integer
 *           example: 25
 *         status:
 *           type: string
 *           example: "em andamento"
 *         observacoes:
 *           type: string
 *           example: "Aluno com bom desempenho nas atividades práticas"
 *         ativo:
 *           type: boolean
 *           example: true
 *         usuario:
 *           type: object
 *           properties:
 *             idusuario:
 *               type: integer
 *               example: 1
 *             login:
 *               type: string
 *               example: "joao.silva@email.com"
 *         plano:
 *           type: object
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
 *     AlunoPlanoListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/AlunoPlano'
 *
 *     AlunoPlanoUpdateRequest:
 *       type: object
 *       properties:
 *         idusuario:
 *           type: integer
 *           description: ID do usuário (obrigatório para identificar a associação)
 *           example: 1
 *         PlanoId:
 *           type: integer
 *           description: ID do plano (obrigatório para identificar a associação)
 *           example: 1
 *         progresso:
 *           type: integer
 *           description: Percentual de progresso no plano (0-100)
 *           example: 50
 *         status:
 *           type: string
 *           enum: [não iniciado, em andamento, concluído, cancelado]
 *           description: Status atual do plano
 *           example: "em andamento"
 *         dataConclusao:
 *           type: string
 *           format: date
 *           description: Data de conclusão (opcional)
 *           example: "2024-04-10"
 *         observacoes:
 *           type: string
 *           description: Observações sobre o progresso
 *           example: "Aluno concluiu todas as atividades práticas"
 *
 *     AlunoPlanoDeleteRequest:
 *       type: object
 *       required:
 *         - idusuario
 *         - PlanoId
 *       properties:
 *         idusuario:
 *           type: integer
 *           description: ID do usuário
 *           example: 1
 *         PlanoId:
 *           type: integer
 *           description: ID do plano
 *           example: 1
 *
 *     AlunoPlanoDeleteResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Associação aluno-plano removida com sucesso"
 */

module.exports = {};
