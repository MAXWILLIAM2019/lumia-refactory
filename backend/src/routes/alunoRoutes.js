/**
 * Rotas para Gerenciamento de Alunos
 * 
 * Este módulo define todas as rotas relacionadas às operações de alunos,
 * seguindo padrões RESTful para as operações CRUD.
 * 
 * Inclui controle de permissões para proteção de recursos.
 * 
 * Schemas estão definidos em: backend/src/docs/schemas/alunoSchemas.js
 */
const express = require('express');
const router = express.Router();
const alunoController = require('../controllers/alunoController');
const { auth, adminOnly, ownProfileOrAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/alunos/test:
 *   get:
 *     summary: Teste do módulo de alunos
 *     description: Verifica se o módulo de alunos está funcionando
 *     tags: [Alunos]
 *     responses:
 *       200:
 *         description: Módulo funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rota de alunos funcionando!"
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de alunos funcionando!' });
});

/**
 * @swagger
 * /api/alunos:
 *   get:
 *     summary: Listar todos os alunos
 *     description: Retorna uma lista com todos os alunos cadastrados no sistema
 *     tags: [Alunos]
 *     responses:
 *       200:
 *         description: Lista de alunos obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoListResponse'
 *             example:
 *               - id: 1
 *                 email: "joao.silva@email.com"
 *                 situacao: true
 *                 nome: "João Silva"
 *                 cpf: "123.456.789-00"
 *                 info:
 *                   IdAlunoInfo: 1
 *                   IdUsuario: 1
 *                   email: "joao.silva@email.com"
 *               - id: 2
 *                 email: "maria.santos@email.com"
 *                 situacao: true
 *                 nome: "Maria Santos"
 *                 cpf: "987.654.321-00"
 *                 info:
 *                   IdAlunoInfo: 2
 *                   IdUsuario: 2
 *                   email: "maria.santos@email.com"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar alunos"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/', alunoController.getAllAlunos);

/**
 * @swagger
 * /api/alunos:
 *   post:
 *     summary: Cadastrar novo aluno
 *     description: Cria um novo aluno no sistema com os dados fornecidos
 *     tags: [Alunos]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoRequest'
 *           examples:
 *             aluno_completo:
 *               summary: Aluno com senha
 *               value:
 *                 nome: "João Silva Santos"
 *                 email: "joao.silva@email.com"
 *                 cpf: "123.456.789-00"
 *                 senha: "123456"
 *             aluno_sem_senha:
 *               summary: Aluno sem senha (será definida depois)
 *               value:
 *                 nome: "Maria Santos Silva"
 *                 email: "maria.santos@email.com"
 *                 cpf: "987.654.321-00"
 *     responses:
 *       201:
 *         description: Aluno cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoResponse'
 *             example:
 *               usuario:
 *                 IdUsuario: 1
 *                 login: "joao.silva@email.com"
 *                 grupo: 1
 *                 situacao: true
 *                 nome: "João Silva Santos"
 *                 cpf: "123.456.789-00"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *               alunoInfo:
 *                 IdAlunoInfo: 1
 *                 IdUsuario: 1
 *                 email: "joao.silva@email.com"
 *       400:
 *         description: Dados inválidos ou duplicados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               campos_obrigatorios:
 *                 summary: Campos obrigatórios não preenchidos
 *                 value:
 *                   message: "Preencha nome, email e CPF."
 *               email_duplicado:
 *                 summary: Email já existe
 *                 value:
 *                   message: "Já existe um usuário com este email."
 *               cpf_duplicado:
 *                 summary: CPF já existe
 *                 value:
 *                   message: "Já existe um usuário com este CPF."
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao cadastrar aluno"
 *               error: "Falha na conexão com o banco de dados"
 */
router.post('/', alunoController.createAluno);

/**
 * @swagger
 * /api/alunos/planos:
 *   get:
 *     summary: Buscar planos do aluno logado
 *     description: Retorna os planos associados ao aluno autenticado
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Planos do aluno obtidos com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: "Plano de Estudos - Desenvolvimento Web"
 *                   descricao:
 *                     type: string
 *                     example: "Plano completo para desenvolvimento web"
 *                   status:
 *                     type: string
 *                     example: "ativo"
 *                   dataInicio:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   dataPrevisaoTermino:
 *                     type: string
 *                     format: date
 *                     example: "2024-06-15"
 *             example:
 *               - id: 1
 *                 nome: "Plano de Estudos - Desenvolvimento Web"
 *                 descricao: "Plano completo para desenvolvimento web"
 *                 status: "ativo"
 *                 dataInicio: "2024-01-15"
 *                 dataPrevisaoTermino: "2024-06-15"
 *               - id: 2
 *                 nome: "Plano Avançado - React"
 *                 descricao: "Plano focado em React e ecossistema"
 *                 status: "concluído"
 *                 dataInicio: "2023-08-01"
 *                 dataPrevisaoTermino: "2023-12-01"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar planos do aluno"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/planos', auth, alunoController.getAlunoPlanos);

/**
 * @swagger
 * /api/alunos/sprints:
 *   get:
 *     summary: Buscar sprints do aluno logado
 *     description: Retorna as sprints associadas ao aluno autenticado. Se for administrador, retorna todas as sprints.
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sprints obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nome:
 *                     type: string
 *                     example: "Sprint 1 - Fundamentos HTML/CSS"
 *                   descricao:
 *                     type: string
 *                     example: "Primeira sprint focada nos fundamentos"
 *                   ordem:
 *                     type: integer
 *                     example: 1
 *                   status:
 *                     type: string
 *                     example: "em_andamento"
 *                   dataInicio:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   dataFim:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-29"
 *                   progresso:
 *                     type: number
 *                     example: 75.5
 *                   metas:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         titulo:
 *                           type: string
 *                           example: "Criar página HTML básica"
 *                         concluida:
 *                           type: boolean
 *                           example: true
 *             example:
 *               - id: 1
 *                 nome: "Sprint 1 - Fundamentos HTML/CSS"
 *                 descricao: "Primeira sprint focada nos fundamentos"
 *                 ordem: 1
 *                 status: "em_andamento"
 *                 dataInicio: "2024-01-15"
 *                 dataFim: "2024-01-29"
 *                 progresso: 75.5
 *                 metas:
 *                   - id: 1
 *                     titulo: "Criar página HTML básica"
 *                     concluida: true
 *                   - id: 2
 *                     titulo: "Estilizar com CSS"
 *                     concluida: false
 *               - id: 2
 *                 nome: "Sprint 2 - JavaScript Básico"
 *                 descricao: "Segunda sprint focada em JavaScript"
 *                 ordem: 2
 *                 status: "pendente"
 *                 dataInicio: "2024-01-30"
 *                 dataFim: "2024-02-13"
 *                 progresso: 0
 *                 metas: []
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar sprints do aluno"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/sprints', auth, alunoController.getAlunoSprints);

/**
 * @swagger
 * /api/alunos/{id}:
 *   get:
 *     summary: Buscar aluno por ID
 *     description: Retorna os dados de um aluno específico pelo ID. Apenas administradores ou o próprio aluno podem acessar.
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do aluno
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Aluno encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Aluno'
 *             example:
 *               id: 1
 *               nome: "João Silva Santos"
 *               email: "joao.silva@email.com"
 *               cpf: "123.456.789-00"
 *               situacao: true
 *               info:
 *                 IdAlunoInfo: 1
 *                 IdUsuario: 1
 *                 email: "joao.silva@email.com"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       403:
 *         description: Acesso negado - apenas o próprio aluno ou administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - você só pode ver seus próprios dados"
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Aluno não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar aluno"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/:id', auth, ownProfileOrAdmin('id'), alunoController.getAlunoById);

/**
 * @swagger
 * /api/alunos/{id}:
 *   put:
 *     summary: Atualizar dados do aluno
 *     description: Atualiza os dados de um aluno. Apenas administradores ou o próprio aluno podem atualizar.
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do aluno
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AlunoRequest'
 *           example:
 *             nome: "João Silva Santos"
 *             email: "joao.santos@email.com"
 *             telefone: "(11) 99999-9999"
 *             biografia: "Estudante de desenvolvimento web com foco em React e Node.js"
 *             formacao: "ensino-superior-completo"
 *             isTrabalhando: true
 *             isAceitaTermos: true
 *     responses:
 *       200:
 *         description: Aluno atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AlunoResponse'
 *       400:
 *         description: Dados inválidos fornecidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               telefone_invalido:
 *                 summary: Telefone com formato inválido
 *                 value:
 *                   message: "Telefone deve ter 10 ou 11 dígitos (formato brasileiro)"
 *                   field: "telefone"
 *                   received: "123"
 *                   expected: "Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX"
 *               email_duplicado:
 *                 summary: Email já existe
 *                 value:
 *                   message: "Já existe um usuário com este email."
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       403:
 *         description: Acesso negado - apenas o próprio aluno ou administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - você só pode atualizar seus próprios dados"
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Aluno não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar aluno"
 *               error: "Falha na conexão com o banco de dados"
 */
router.put('/:id', auth, ownProfileOrAdmin('id'), alunoController.updateAluno);

/**
 * @swagger
 * /api/alunos/{id}:
 *   delete:
 *     summary: Remover aluno (Admin)
 *     description: Remove um aluno do sistema. Apenas administradores podem usar esta funcionalidade.
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do aluno a ser removido
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Aluno removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Aluno deletado com sucesso"
 *             example:
 *               message: "Aluno deletado com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem remover alunos"
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Aluno não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao deletar aluno"
 *               error: "Falha na conexão com o banco de dados"
 */
router.delete('/:id', auth, adminOnly, alunoController.deleteAluno);

/**
 * @swagger
 * /api/alunos/{id}/definir-senha:
 *   post:
 *     summary: Definir/Alterar senha do aluno
 *     description: |
 *       Define ou altera a senha de um aluno com comportamento diferenciado:
 *       - **ALUNO**: Requer senha atual para validação (alteração de senha)
 *       - **ADMINISTRADOR**: Não requer senha atual (criação/definição de senha)
 *       
 *       Apenas administradores ou o próprio aluno podem usar esta funcionalidade.
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do aluno
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SenhaRequest'
 *           examples:
 *             aluno_alterando:
 *               summary: Aluno alterando senha (requer senha atual)
 *               value:
 *                 senhaAtual: "senhaAtual123"
 *                 novaSenha: "novaSenha123"
 *             admin_definindo:
 *               summary: Admin definindo senha (não requer senha atual)
 *               value:
 *                 novaSenha: "novaSenha123"
 *     responses:
 *       200:
 *         description: Senha definida/alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SenhaResponse'
 *             examples:
 *               aluno_sucesso:
 *                 summary: Aluno alterando senha
 *                 value:
 *                   message: "Senha alterada com sucesso"
 *               admin_sucesso:
 *                 summary: Admin definindo senha
 *                 value:
 *                   message: "Senha definida com sucesso"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               senha_atual_obrigatoria:
 *                 summary: Senha atual não fornecida
 *                 value:
 *                   message: "A senha atual é obrigatória"
 *               nova_senha_obrigatoria:
 *                 summary: Nova senha não fornecida
 *                 value:
 *                   message: "A nova senha é obrigatória"
 *               senha_curta:
 *                 summary: Nova senha muito curta
 *                 value:
 *                   message: "A nova senha deve ter pelo menos 6 caracteres"
 *               senha_atual_incorreta:
 *                 summary: Senha atual incorreta
 *                 value:
 *                   message: "Senha atual incorreta"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       403:
 *         description: Acesso negado - apenas o próprio aluno ou administrador
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso não autorizado a este recurso"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao alterar senha"
 *               error: "Falha na conexão com o banco de dados"
 */
router.post('/:id/definir-senha', auth, ownProfileOrAdmin('id'), alunoController.definirSenha);

/**
 * @swagger
 * /api/alunos/{id}/gerar-senha:
 *   post:
 *     summary: Gerar senha aleatória (Admin)
 *     description: Gera uma senha aleatória para um aluno. Apenas administradores podem usar esta funcionalidade.
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do aluno
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Senha gerada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SenhaResponse'
 *             example:
 *               message: "Senha gerada com sucesso"
 *               senhaGerada: "Abc123Xyz"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem gerar senhas"
 *       404:
 *         description: Aluno não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Aluno não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao gerar senha"
 *               error: "Falha na conexão com o banco de dados"
 */
router.post('/:id/gerar-senha', auth, adminOnly, alunoController.gerarSenha);

/**
 * @swagger
 * /api/alunos/{id}/notificacoes:
 *   put:
 *     summary: Atualizar configurações de notificação do aluno
 *     description: Atualiza as preferências de notificação do aluno logado
 *     tags: [Alunos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do aluno
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificacoes
 *             properties:
 *               notificacoes:
 *                 type: object
 *                 properties:
 *                   novidadesPlataforma:
 *                     type: boolean
 *                     description: Notificações sobre atualizações da plataforma
 *                     example: true
 *                   mensagensMentor:
 *                     type: boolean
 *                     description: Notificações de mensagens do mentor
 *                     example: true
 *                   novoMaterial:
 *                     type: boolean
 *                     description: Notificações de novo material publicado
 *                     example: true
 *                   atividadesSimulados:
 *                     type: boolean
 *                     description: Notificações de atividades e simulados
 *                     example: false
 *                   mentorias:
 *                     type: boolean
 *                     description: Notificações de mentorias agendadas
 *                     example: false
 *           example:
 *             notificacoes:
 *               novidadesPlataforma: true
 *               mensagensMentor: true
 *               novoMaterial: true
 *               atividadesSimulados: false
 *               mentorias: false
 *     responses:
 *       200:
 *         description: Configurações atualizadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Configurações de notificação atualizadas com sucesso"
 *                 notificacoes:
 *                   type: object
 *                   properties:
 *                     novidadesPlataforma:
 *                       type: boolean
 *                       example: true
 *                     mensagensMentor:
 *                       type: boolean
 *                       example: true
 *                     novoMaterial:
 *                       type: boolean
 *                       example: true
 *                     atividadesSimulados:
 *                       type: boolean
 *                       example: false
 *                     mentorias:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Configurações de notificação são obrigatórias"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token não fornecido"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Usuário não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar notificações"
 */
router.put('/:id/notificacoes', auth, ownProfileOrAdmin('id'), alunoController.atualizarNotificacoes);

module.exports = router; 