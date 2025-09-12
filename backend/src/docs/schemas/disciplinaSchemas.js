/**
 * @swagger
 * components:
 *   schemas:
 *     Disciplina:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único da disciplina
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome da disciplina
 *           example: "Desenvolvimento Web"
 *         descricao:
 *           type: string
 *           description: Descrição da disciplina
 *           example: "Disciplina focada em tecnologias web modernas"
 *         ativa:
 *           type: boolean
 *           description: Status da disciplina (ativa/inativa)
 *           example: true
 *         versao:
 *           type: integer
 *           description: Versão da disciplina
 *           example: 1
 *         disciplina_origem_id:
 *           type: integer
 *           description: ID da disciplina original (para versões)
 *           example: null
 *         assuntos:
 *           type: array
 *           description: Lista de assuntos da disciplina
 *           items:
 *             $ref: '#/components/schemas/Assunto'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     DisciplinaRequest:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da disciplina
 *           example: "Desenvolvimento Web"
 *         ativa:
 *           type: boolean
 *           description: Status da disciplina (ativa/inativa)
 *           example: true
 *         assuntos:
 *           type: array
 *           description: Lista de assuntos da disciplina
 *           items:
 *             $ref: '#/components/schemas/AssuntoRequest'
 *
 *     DisciplinaResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Desenvolvimento Web"
 *         descricao:
 *           type: string
 *           example: "Disciplina focada em tecnologias web modernas"
 *         ativa:
 *           type: boolean
 *           example: true
 *         versao:
 *           type: integer
 *           example: 1
 *         disciplina_origem_id:
 *           type: integer
 *           example: null
 *         assuntos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Assunto'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     DisciplinaListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Disciplina'
 *
 *     Assunto:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do assunto
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome do assunto
 *           example: "HTML/CSS"
 *         disciplinaId:
 *           type: integer
 *           description: ID da disciplina
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
 *     AssuntoRequest:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome do assunto
 *           example: "HTML/CSS"
 *
 *     DisciplinaUpdateResponse:
 *       type: object
 *       properties:
 *         disciplina:
 *           $ref: '#/components/schemas/Disciplina'
 *         message:
 *           type: string
 *           example: "Disciplina atualizada com sucesso"
 *         versionada:
 *           type: boolean
 *           description: Indica se foi criada uma nova versão
 *           example: false
 *         versao:
 *           type: integer
 *           description: Número da versão (apenas se versionada)
 *           example: 2
 *
 *     VersaoDisciplinaRequest:
 *       type: object
 *       required:
 *         - nome
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da nova versão da disciplina
 *           example: "Desenvolvimento Web Avançado"
 *         descricao:
 *           type: string
 *           description: Descrição da nova versão
 *           example: "Versão atualizada com tecnologias mais recentes"
 *         ativa:
 *           type: boolean
 *           description: Status da disciplina
 *           example: true
 *         assuntos:
 *           type: array
 *           description: Lista de assuntos da disciplina
 *           items:
 *             $ref: '#/components/schemas/AssuntoRequest'
 *         copiarAssuntos:
 *           type: boolean
 *           description: Se deve copiar os assuntos da versão anterior
 *           example: true
 *
 *     ComparacaoDisciplina:
 *       type: object
 *       properties:
 *         metadados:
 *           type: object
 *           properties:
 *             disciplina1:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 versao:
 *                   type: integer
 *                   example: 1
 *                 disciplina_origem_id:
 *                   type: integer
 *                   example: null
 *             disciplina2:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 2
 *                 versao:
 *                   type: integer
 *                   example: 2
 *                 disciplina_origem_id:
 *                   type: integer
 *                   example: 1
 *         campos:
 *           type: object
 *           description: Campos que foram alterados
 *           properties:
 *             nome:
 *               type: object
 *               properties:
 *                 antes:
 *                   type: string
 *                   example: "Desenvolvimento Web"
 *                 depois:
 *                   type: string
 *                   example: "Desenvolvimento Web Avançado"
 *             descricao:
 *               type: object
 *               properties:
 *                 antes:
 *                   type: string
 *                   example: "Disciplina básica de web"
 *                 depois:
 *                   type: string
 *                   example: "Disciplina avançada de web"
 *         assuntos:
 *           type: object
 *           properties:
 *             adicionados:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["React", "Node.js"]
 *             removidos:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["jQuery"]
 *             mantidos:
 *               type: array
 *               items:
 *                 type: string
 *               example: ["HTML", "CSS", "JavaScript"]
 *
 *     DisciplinaVersao:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         nome:
 *           type: string
 *           example: "Desenvolvimento Web"
 *         descricao:
 *           type: string
 *           example: "Disciplina focada em tecnologias web modernas"
 *         ativa:
 *           type: boolean
 *           example: true
 *         versao:
 *           type: integer
 *           example: 1
 *         disciplina_origem_id:
 *           type: integer
 *           example: null
 *         assuntos:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Assunto'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     DisciplinaVersaoListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/DisciplinaVersao'
 */

module.exports = {};
