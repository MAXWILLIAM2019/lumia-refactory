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
 *         biografia:
 *           type: string
 *           description: Biografia do aluno
 *           example: "Estudante de desenvolvimento web com foco em React e Node.js"
 *         formacao:
 *           type: string
 *           description: Nível de formação do aluno
 *           example: "ensino-superior-completo"
 *         isTrabalhando:
 *           type: boolean
 *           description: Indica se o aluno está trabalhando atualmente
 *           example: true
 *         isAceitaTermos:
 *           type: boolean
 *           description: Indica se o aluno aceita os termos de uso
 *           example: true
 *         situacao:
 *           type: boolean
 *           description: Situação do aluno (ativo/inativo)
 *           example: true
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
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome completo do aluno
 *           example: "João Silva Santos"
 *         email:
 *           type: string
 *           description: Email do aluno
 *           example: "joao.silva@email.com"
 *         senha:
 *           type: string
 *           description: Senha do aluno (opcional)
 *           example: "senha123"
 *         telefone:
 *           type: string
 *           description: Telefone do aluno (opcional)
 *           example: "(11) 99999-9999"
 *         biografia:
 *           type: string
 *           description: Biografia do aluno (opcional)
 *           example: "Estudante de desenvolvimento web com foco em React e Node.js"
 *         formacao:
 *           type: string
 *           description: Nível de formação do aluno (opcional)
 *           example: "ensino-superior-completo"
 *         isTrabalhando:
 *           type: boolean
 *           description: Indica se o aluno está trabalhando atualmente (opcional)
 *           example: true
 *         isAceitaTermos:
 *           type: boolean
 *           description: Indica se o aluno aceita os termos de uso (opcional)
 *           example: true
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
 *             telefone:
 *               type: string
 *               example: "(11) 99999-9999"
 *             biografia:
 *               type: string
 *               example: "Estudante de desenvolvimento web com foco em React e Node.js"
 *             formacao:
 *               type: string
 *               example: "ensino-superior-completo"
 *             is_trabalhando:
 *               type: boolean
 *               example: true
 *             is_aceita_termos:
 *               type: boolean
 *               example: true
 *
 *     AlunoListResponse:
 *       type: array
 *       items:
 *         $ref: '#/components/schemas/Aluno'
 *
 *     SenhaRequest:
 *       type: object
 *       required:
 *         - novaSenha
 *       properties:
 *         senhaAtual:
 *           type: string
 *           description: Senha atual do aluno (obrigatória apenas para alunos)
 *           example: "senhaAtual123"
 *         novaSenha:
 *           type: string
 *           description: Nova senha do aluno (mínimo 6 caracteres)
 *           minLength: 6
 *           example: "novaSenha123"
 *
 *     SenhaResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Senha alterada com sucesso"
 *         senhaGerada:
 *           type: string
 *           description: Senha gerada automaticamente (apenas para gerar-senha)
 *           example: "Abc123Xyz"
 */

module.exports = {};
