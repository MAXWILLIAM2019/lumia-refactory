/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - login
 *         - senha
 *         - grupo
 *       properties:
 *         IdUsuario:
 *           type: integer
 *           description: ID único do usuário
 *           example: 1
 *         login:
 *           type: string
 *           description: Login/email do usuário
 *           example: "joao.silva@email.com"
 *         grupo:
 *           type: integer
 *           description: ID do grupo do usuário
 *           example: 1
 *         situacao:
 *           type: string
 *           description: Situação do usuário
 *           example: "ativo"
 *         grupoUsuario:
 *           type: object
 *           description: Informações do grupo do usuário
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Aluno"
 *         alunoInfo:
 *           type: object
 *           description: Informações específicas do aluno (se aplicável)
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "João Silva"
 *             email:
 *               type: string
 *               example: "joao.silva@email.com"
 *         adminInfo:
 *           type: object
 *           description: Informações específicas do administrador (se aplicável)
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             nome:
 *               type: string
 *               example: "Admin Sistema"
 *             email:
 *               type: string
 *               example: "admin@sistema.com"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - nome
 *         - login
 *         - senha
 *         - grupo
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do usuário
 *           example: "João Silva Santos"
 *         login:
 *           type: string
 *           description: Login/email do usuário
 *           example: "joao.silva@email.com"
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *           example: "senha123"
 *         grupo:
 *           type: string
 *           description: Grupo do usuário (aluno ou admin)
 *           example: "aluno"
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - login
 *         - senha
 *         - grupo
 *       properties:
 *         login:
 *           type: string
 *           description: Login/email do usuário
 *           example: "joao.silva@email.com"
 *         senha:
 *           type: string
 *           description: Senha do usuário
 *           example: "senha123"
 *         grupo:
 *           type: string
 *           description: Grupo do usuário (aluno ou admin)
 *           example: "aluno"
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Login realizado com sucesso"
 *         token:
 *           type: string
 *           description: Token JWT para autenticação
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Erro na operação"
 *         error:
 *           type: string
 *           description: Detalhes do erro (opcional)
 *           example: "Database connection failed"
 */

module.exports = {};
