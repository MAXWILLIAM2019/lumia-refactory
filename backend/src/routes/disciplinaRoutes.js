/**
 * Rotas para gerenciamento de disciplinas
 * 
 * Este arquivo define os endpoints da API relacionados às disciplinas.
 * Inclui rotas para o sistema de versionamento de disciplinas.
 */
const express = require('express');
const router = express.Router();
const disciplinaController = require('../controllers/disciplinaController');
const authMiddleware = require('../middlewares/authMiddleware');

// Schemas estão definidos em: backend/src/docs/schemas/disciplinaSchemas.js

// Aplicar middleware de autenticação em todas as rotas
router.use(authMiddleware);

/**
 * @swagger
 * /api/disciplinas:
 *   get:
 *     summary: Listar todas as disciplinas
 *     description: Retorna uma lista completa de todas as disciplinas cadastradas no sistema, incluindo suas informações básicas e assuntos relacionados
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaListResponse'
 *             examples:
 *               disciplinas:
 *                 summary: Lista de disciplinas
 *                 value:
 *                   - id: 1
 *                     nome: "Desenvolvimento Web"
 *                     descricao: "Disciplina focada em tecnologias web modernas"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                       - id: 2
 *                         nome: "JavaScript"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   - id: 2
 *                     nome: "Banco de Dados"
 *                     descricao: "Fundamentos de banco de dados relacionais"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 3
 *                         nome: "SQL"
 *                         disciplinaId: 2
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar disciplinas"
 *               error: "Database connection failed"
 */
router.get('/', disciplinaController.listarDisciplinas);

/**
 * @swagger
 * /api/disciplinas/ativas:
 *   get:
 *     summary: Listar disciplinas ativas
 *     description: Retorna apenas as disciplinas que estão ativas no sistema, excluindo as inativas
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de disciplinas ativas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaListResponse'
 *             examples:
 *               disciplinas_ativas:
 *                 summary: Lista de disciplinas ativas
 *                 value:
 *                   - id: 1
 *                     nome: "Desenvolvimento Web"
 *                     descricao: "Disciplina focada em tecnologias web modernas"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar disciplinas ativas"
 *               error: "Database connection failed"
 */
router.get('/ativas', disciplinaController.listarDisciplinasAtivas);

/**
 * @swagger
 * /api/disciplinas/{id}:
 *   get:
 *     summary: Buscar disciplina por ID
 *     description: Retorna os dados completos de uma disciplina específica, incluindo seus assuntos
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da disciplina
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disciplina encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disciplina'
 *             examples:
 *               disciplina:
 *                 summary: Disciplina encontrada
 *                 value:
 *                   id: 1
 *                   nome: "Desenvolvimento Web"
 *                   descricao: "Disciplina focada em tecnologias web modernas"
 *                   ativa: true
 *                   versao: 1
 *                   disciplina_origem_id: null
 *                   assuntos:
 *                     - id: 1
 *                       nome: "HTML/CSS"
 *                       disciplinaId: 1
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                     - id: 2
 *                       nome: "JavaScript"
 *                       disciplinaId: 1
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar disciplina"
 *               error: "Database connection failed"
 */
router.get('/:id', disciplinaController.buscarDisciplina);

/**
 * @swagger
 * /api/disciplinas:
 *   post:
 *     summary: Criar nova disciplina
 *     description: Cria uma nova disciplina no sistema. Se a disciplina já existir com o mesmo nome, retorna erro
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisciplinaRequest'
 *           examples:
 *             disciplina_completa:
 *               summary: Disciplina com assuntos
 *               value:
 *                 nome: "Desenvolvimento Web"
 *                 descricao: "Disciplina focada em tecnologias web modernas"
 *                 ativa: true
 *                 assuntos:
 *                   - nome: "HTML/CSS"
 *                   - nome: "JavaScript"
 *                   - nome: "React"
 *             disciplina_simples:
 *               summary: Disciplina básica
 *               value:
 *                 nome: "Banco de Dados"
 *                 descricao: "Fundamentos de banco de dados relacionais"
 *                 ativa: true
 *     responses:
 *       201:
 *         description: Disciplina criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disciplina'
 *             examples:
 *               disciplina_criada:
 *                 summary: Disciplina criada
 *                 value:
 *                   id: 3
 *                   nome: "Desenvolvimento Web"
 *                   descricao: "Disciplina focada em tecnologias web modernas"
 *                   ativa: true
 *                   versao: 1
 *                   disciplina_origem_id: null
 *                   assuntos:
 *                     - id: 4
 *                       nome: "HTML/CSS"
 *                       disciplinaId: 3
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                     - id: 5
 *                       nome: "JavaScript"
 *                       disciplinaId: 3
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos ou disciplina já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               disciplina_existe:
 *                 summary: Disciplina já existe
 *                 value:
 *                   message: "Já existe uma disciplina com este nome"
 *               dados_invalidos:
 *                 summary: Dados inválidos
 *                 value:
 *                   message: "Nome da disciplina é obrigatório"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao criar disciplina"
 *               error: "Database connection failed"
 */
router.post('/', disciplinaController.criarDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}:
 *   put:
 *     summary: Atualizar disciplina
 *     description: Atualiza uma disciplina existente. Se a disciplina estiver em uso por planos, cria automaticamente uma nova versão
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da disciplina
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DisciplinaRequest'
 *           examples:
 *             atualizacao_simples:
 *               summary: Atualização simples
 *               value:
 *                 nome: "Desenvolvimento Web Avançado"
 *                 descricao: "Disciplina atualizada com tecnologias mais recentes"
 *                 ativa: true
 *             atualizacao_com_assuntos:
 *               summary: Atualização com assuntos
 *               value:
 *                 nome: "Desenvolvimento Web"
 *                 descricao: "Disciplina focada em tecnologias web modernas"
 *                 ativa: true
 *                 assuntos:
 *                   - nome: "HTML/CSS"
 *                   - nome: "JavaScript"
 *                   - nome: "React"
 *                   - nome: "Node.js"
 *     responses:
 *       200:
 *         description: Disciplina atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaUpdateResponse'
 *             examples:
 *               atualizacao_direta:
 *                 summary: Atualização direta (não versionada)
 *                 value:
 *                   disciplina:
 *                     id: 1
 *                     nome: "Desenvolvimento Web Avançado"
 *                     descricao: "Disciplina atualizada com tecnologias mais recentes"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   message: "Disciplina atualizada com sucesso"
 *                   versionada: false
 *                   versao: null
 *               nova_versao:
 *                 summary: Nova versão criada (disciplina em uso)
 *                 value:
 *                   disciplina:
 *                     id: 2
 *                     nome: "Desenvolvimento Web (editada) v2"
 *                     descricao: "Disciplina atualizada com tecnologias mais recentes"
 *                     ativa: true
 *                     versao: 2
 *                     disciplina_origem_id: 1
 *                     assuntos:
 *                       - id: 3
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 2
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   message: "Nova versão da disciplina criada automaticamente pois está em uso por planos"
 *                   versionada: true
 *                   versao: 2
 *       400:
 *         description: Dados inválidos ou nome já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               nome_existe:
 *                 summary: Nome já existe
 *                 value:
 *                   message: "Já existe outra disciplina com este nome"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar disciplina"
 *               error: "Database connection failed"
 */
router.put('/:id', disciplinaController.atualizarDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}:
 *   delete:
 *     summary: Remover disciplina
 *     description: Remove uma disciplina do sistema. Os assuntos relacionados são removidos em cascata
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da disciplina
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Disciplina removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Disciplina removida com sucesso"
 *             examples:
 *               sucesso:
 *                 summary: Disciplina removida
 *                 value:
 *                   message: "Disciplina removida com sucesso"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao remover disciplina"
 *               error: "Database connection failed"
 */
router.delete('/:id', disciplinaController.removerDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}/versoes:
 *   post:
 *     summary: Criar nova versão de disciplina
 *     description: Cria uma nova versão de uma disciplina existente, mantendo o histórico de versões
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina original
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VersaoDisciplinaRequest'
 *           examples:
 *             nova_versao_com_assuntos:
 *               summary: Nova versão com assuntos
 *               value:
 *                 nome: "Desenvolvimento Web Avançado"
 *                 descricao: "Versão atualizada com tecnologias mais recentes"
 *                 ativa: true
 *                 assuntos:
 *                   - nome: "HTML/CSS"
 *                   - nome: "JavaScript"
 *                   - nome: "React"
 *                   - nome: "Node.js"
 *                 copiarAssuntos: false
 *             nova_versao_copiando_assuntos:
 *               summary: Nova versão copiando assuntos
 *               value:
 *                 nome: "Desenvolvimento Web v2"
 *                 descricao: "Versão atualizada"
 *                 ativa: true
 *                 copiarAssuntos: true
 *     responses:
 *       201:
 *         description: Nova versão da disciplina criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Disciplina'
 *             examples:
 *               versao_criada:
 *                 summary: Nova versão criada
 *                 value:
 *                   id: 2
 *                   nome: "Desenvolvimento Web (editada) v2"
 *                   descricao: "Versão atualizada com tecnologias mais recentes"
 *                   ativa: true
 *                   versao: 2
 *                   disciplina_origem_id: 1
 *                   assuntos:
 *                     - id: 3
 *                       nome: "HTML/CSS"
 *                       disciplinaId: 2
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                     - id: 4
 *                       nome: "JavaScript"
 *                       disciplinaId: 2
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       updatedAt: "2024-01-15T10:30:00.000Z"
 *                   createdAt: "2024-01-15T10:30:00.000Z"
 *                   updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Disciplina original não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Disciplina original não encontrada"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Nome da disciplina é obrigatório"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao criar nova versão da disciplina"
 *               error: "Database connection failed"
 */
router.post('/:id/versoes', disciplinaController.criarVersaoDisciplina);

/**
 * @swagger
 * /api/disciplinas/{id}/versoes:
 *   get:
 *     summary: Listar versões de disciplina
 *     description: Retorna todas as versões de uma disciplina, incluindo a versão original
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID da disciplina (pode ser qualquer versão)
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Lista de versões retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DisciplinaVersaoListResponse'
 *             examples:
 *               versoes:
 *                 summary: Lista de versões
 *                 value:
 *                   - id: 1
 *                     nome: "Desenvolvimento Web"
 *                     descricao: "Disciplina focada em tecnologias web modernas"
 *                     ativa: true
 *                     versao: 1
 *                     disciplina_origem_id: null
 *                     assuntos:
 *                       - id: 1
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 1
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *                   - id: 2
 *                     nome: "Desenvolvimento Web (editada) v2"
 *                     descricao: "Versão atualizada com tecnologias mais recentes"
 *                     ativa: true
 *                     versao: 2
 *                     disciplina_origem_id: 1
 *                     assuntos:
 *                       - id: 3
 *                         nome: "HTML/CSS"
 *                         disciplinaId: 2
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                       - id: 4
 *                         nome: "React"
 *                         disciplinaId: 2
 *                         createdAt: "2024-01-15T10:30:00.000Z"
 *                         updatedAt: "2024-01-15T10:30:00.000Z"
 *                     createdAt: "2024-01-15T10:30:00.000Z"
 *                     updatedAt: "2024-01-15T10:30:00.000Z"
 *       404:
 *         description: Disciplina não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Disciplina não encontrada"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao listar versões da disciplina"
 *               error: "Database connection failed"
 */
router.get('/:id/versoes', disciplinaController.listarVersoesDisciplina);

/**
 * @swagger
 * /api/disciplinas/comparar/{id1}/{id2}:
 *   get:
 *     summary: Comparar versões de disciplina
 *     description: Compara duas versões de uma disciplina e retorna as diferenças entre elas
 *     tags: [Disciplinas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id1
 *         required: true
 *         description: ID da primeira versão
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: id2
 *         required: true
 *         description: ID da segunda versão
 *         schema:
 *           type: integer
 *           example: 2
 *     responses:
 *       200:
 *         description: Comparação realizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ComparacaoDisciplina'
 *             examples:
 *               comparacao:
 *                 summary: Comparação entre versões
 *                 value:
 *                   metadados:
 *                     disciplina1:
 *                       id: 1
 *                       versao: 1
 *                     disciplina2:
 *                       id: 2
 *                       versao: 2
 *                   campos:
 *                     nome:
 *                       antes: "Desenvolvimento Web"
 *                       depois: "Desenvolvimento Web (editada) v2"
 *                     descricao:
 *                       antes: "Disciplina focada em tecnologias web modernas"
 *                       depois: "Versão atualizada com tecnologias mais recentes"
 *                   assuntos:
 *                     adicionados: ["React", "Node.js"]
 *                     removidos: ["jQuery"]
 *                     mantidos: ["HTML/CSS", "JavaScript"]
 *       400:
 *         description: Disciplinas não são versões da mesma disciplina original
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "As disciplinas não são versões da mesma disciplina original"
 *       404:
 *         description: Uma ou ambas as disciplinas não foram encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Uma ou ambas as disciplinas não foram encontradas"
 *       401:
 *         description: Token de autenticação inválido ou ausente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso inválido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao comparar versões da disciplina"
 *               error: "Database connection failed"
 */
router.get('/comparar/:id1/:id2', disciplinaController.compararVersoesDisciplina);

module.exports = router; 