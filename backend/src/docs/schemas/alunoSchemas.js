/**
 * @swagger
 * components:
 *   schemas:
 *     Aluno:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - cpf
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único do aluno
 *           example: 1
 *         nome:
 *           type: string
 *           description: Nome completo do aluno
 *           example: "João Silva Santos"
 *         email:
 *           type: string
 *           description: Email do aluno
 *           example: "joao.silva@email.com"
 *         cpf:
 *           type: string
 *           description: CPF do aluno
 *           example: "123.456.789-00"
 *         telefone:
 *           type: string
 *           description: Telefone do aluno
 *           example: "(11) 99999-9999"
 *         dataNascimento:
 *           type: string
 *           format: date
 *           description: Data de nascimento do aluno
 *           example: "1995-05-15"
 *         endereco:
 *           type: string
 *           description: Endereço do aluno
 *           example: "Rua das Flores, 123 - São Paulo/SP"
 *         situacao:
 *           type: string
 *           description: Situação do aluno
 *           example: "ativo"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2024-01-15T10:30:00.000Z"
 *
 *     AlunoRequest:
 *       type: object
 *       required:
 *         - nome
 *         - email
 *         - cpf
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do aluno
 *           example: "João Silva Santos"
 *         email:
 *           type: string
 *           description: Email do aluno
 *           example: "joao.silva@email.com"
 *         cpf:
 *           type: string
 *           description: CPF do aluno
 *           example: "123.456.789-00"
 *         senha:
 *           type: string
 *           description: Senha do aluno (opcional)
 *           example: "senha123"
 *
 *     AlunoResponse:
 *       type: object
 *       properties:
 *         usuario:
 *           type: object
 *           properties:
 *             IdUsuario:
 *               type: integer
 *               example: 1
 *             login:
 *               type: string
 *               example: "joao.silva@email.com"
 *             grupo:
 *               type: integer
 *               example: 1
 *             situacao:
 *               type: boolean
 *               example: true
 *             nome:
 *               type: string
 *               example: "João Silva Santos"
 *             cpf:
 *               type: string
 *               example: "123.456.789-00"
 *             createdAt:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00.000Z"
 *             updatedAt:
 *               type: string
 *               format: date-time
 *               example: "2024-01-15T10:30:00.000Z"
 *         alunoInfo:
 *           type: object
 *           properties:
 *             IdAlunoInfo:
 *               type: integer
 *               example: 1
 *             IdUsuario:
 *               type: integer
 *               example: 1
 *             email:
 *               type: string
 *               example: "joao.silva@email.com"
 *
 *     AlunoListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Aluno'
 *
 *     SenhaRequest:
 *       type: object
 *       required:
 *         - senha
 *       properties:
 *         senha:
 *           type: string
 *           description: Nova senha do aluno
 *           example: "novaSenha123"
 *
 *     SenhaResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Senha definida com sucesso"
 *         senhaGerada:
 *           type: string
 *           description: Senha gerada automaticamente (apenas para gerar-senha)
 *           example: "Abc123Xyz"
 */

module.exports = {};
