/**
 * @swagger
 * components:
 *   schemas:
 *     PlanoMestre:
 *       type: object
 *       required:
 *         - nome
 *         - cargo
 *         - descricao
 *         - duracao
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do plano mestre
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome do plano mestre
 *           example: "Plano de Desenvolvimento Web Frontend"
 *         cargo:
 *           type: string
 *           description: Cargo alvo do plano
 *           example: "Desenvolvedor Frontend"
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do plano
 *           example: "Plano completo para formação em desenvolvimento web frontend com foco em React, HTML, CSS e JavaScript"
 *         duracao:
 *           type: integer
 *           description: Duração do plano em meses
 *           example: 6
 *         versao:
 *           type: string
 *           description: Versão do plano mestre
 *           example: "1.0"
 *         ativo:
 *           type: boolean
 *           description: Se o plano mestre está ativo para uso
 *           example: true
 *         sprintsMestre:
 *           type: array
 *           description: Lista de sprints mestre associadas
 *           items:
 *             $ref: '#/components/schemas/SprintMestre'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     PlanoMestreRequest:
 *       type: object
 *       required:
 *         - nome
 *         - cargo
 *         - descricao
 *         - duracao
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do plano mestre
 *           example: "Plano de Desenvolvimento Web Frontend"
 *         cargo:
 *           type: string
 *           description: Cargo alvo do plano
 *           example: "Desenvolvedor Frontend"
 *         descricao:
 *           type: string
 *           description: Descrição detalhada do plano
 *           example: "Plano completo para formação em desenvolvimento web frontend com foco em React, HTML, CSS e JavaScript"
 *         duracao:
 *           type: integer
 *           description: Duração do plano em meses
 *           example: 6
 *         versao:
 *           type: string
 *           description: Versão do plano mestre (opcional, default: 1.0)
 *           example: "1.0"
 *
 *     PlanoMestreResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Plano de Desenvolvimento Web Frontend"
 *         cargo:
 *           type: string
 *           example: "Desenvolvedor Frontend"
 *         descricao:
 *           type: string
 *           example: "Plano completo para formação em desenvolvimento web frontend com foco em React, HTML, CSS e JavaScript"
 *         duracao:
 *           type: integer
 *           example: 6
 *         versao:
 *           type: string
 *           example: "1.0"
 *         ativo:
 *           type: boolean
 *           example: true
 *         sprintsMestre:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SprintMestre'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     PlanoMestreListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/PlanoMestre'
 *
 *     CriarInstanciaRequest:
 *       type: object
 *       required:
 *         - planoMestreId
 *         - idUsuario
 *       properties:
 *         planoMestreId:
 *           type: integer
 *           description: ID do plano mestre a ser instanciado
 *           example: 1
 *         idUsuario:
 *           type: integer
 *           description: ID do usuário que receberá o plano
 *           example: 1
 *         dataInicio:
 *           type: string
 *           format: date
 *           description: Data de início do plano (opcional, default: data atual)
 *           example: "2024-01-15"
 *         status:
 *           type: string
 *           enum: [não iniciado, em andamento, concluído, cancelado]
 *           description: Status inicial do plano (opcional, default: 'não iniciado')
 *           example: "não iniciado"
 *         observacoes:
 *           type: string
 *           description: Observações iniciais (opcional)
 *           example: "Plano criado a partir do template de Desenvolvimento Web"
 *
 *     CriarInstanciaResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Plano personalizado criado com sucesso"
 *         plano:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Plano de Desenvolvimento Web Frontend"
 *             cargo:
 *               type: string
 *               example: "Desenvolvedor Frontend"
 *             plano_mestre_id:
 *               type: integer
 *               example: 1
 */

module.exports = {};
