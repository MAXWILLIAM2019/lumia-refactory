const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

// Schemas estão definidos em: backend/src/docs/schemas/sprintSchemas.js

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

/**
 * @swagger
 * /api/sprints/test:
 *   get:
 *     summary: Testar conexão do módulo de sprints
 *     description: Endpoint de teste para verificar se o módulo de sprints está funcionando corretamente
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Módulo funcionando corretamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Rota de sprint funcionando!"
 *             example:
 *               message: "Rota de sprint funcionando!"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 */
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de sprint funcionando!' });
});

/**
 * @swagger
 * /api/sprints:
 *   get:
 *     summary: Listar todas as sprints mestre
 *     description: Retorna todas as sprints mestre (templates) do sistema com suas metas mestre e dados do plano associado.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sprints mestre obtida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestreListResponse'
 *             example:
 *               - id: 1
 *                 nome: "Sprint 1 - Fundamentos HTML/CSS"
 *                 PlanoId: 1
 *                 posicao: 1
 *                 dataInicio: "2024-01-15"
 *                 dataFim: "2024-01-29"
 *                 metas:
 *                   - id: 1
 *                     disciplina: "HTML"
 *                     tipo: "teoria"
 *                     titulo: "Estrutura básica do HTML"
 *                     comandos: "Criar página HTML com estrutura básica"
 *                     link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                     relevancia: 5
 *                     tempoEstudado: "00:00"
 *                     desempenho: 0
 *                     status: "Pendente"
 *                     totalQuestoes: 0
 *                     questoesCorretas: 0
 *                     SprintId: 1
 *                     posicao: 1
 *                 Plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   duracao: 90
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar sprints mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/', sprintController.getAllSprints);

/**
 * @swagger
 * /api/sprints:
 *   post:
 *     summary: Criar nova sprint mestre (Admin)
 *     description: Cria uma nova sprint mestre (template) com suas metas mestre associadas. Apenas administradores podem criar sprints.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SprintMestreRequest'
 *           example:
 *             nome: "Sprint 1 - Fundamentos HTML/CSS"
 *             dataInicio: "2024-01-15"
 *             dataFim: "2024-01-29"
 *             planoId: 1
 *             metas:
 *               - disciplina: "HTML"
 *                 tipo: "teoria"
 *                 titulo: "Estrutura básica do HTML"
 *                 comandos: "Criar página HTML com estrutura básica"
 *                 link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                 relevancia: 5
 *                 posicao: 1
 *               - disciplina: "CSS"
 *                 tipo: "pratica"
 *                 titulo: "Estilização básica com CSS"
 *                 comandos: "Aplicar estilos CSS em uma página HTML"
 *                 link: "https://developer.mozilla.org/pt-BR/docs/Web/CSS"
 *                 relevancia: 4
 *                 posicao: 2
 *     responses:
 *       201:
 *         description: Sprint mestre criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestreResponse'
 *             example:
 *               id: 1
 *               nome: "Sprint 1 - Fundamentos HTML/CSS"
 *               PlanoId: 1
 *               posicao: 1
 *               dataInicio: "2024-01-15"
 *               dataFim: "2024-01-29"
 *               metas:
 *                 - id: 1
 *                   disciplina: "HTML"
 *                   tipo: "teoria"
 *                   titulo: "Estrutura básica do HTML"
 *                   comandos: "Criar página HTML com estrutura básica"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                   relevancia: 5
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 1
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "É necessário associar a sprint a um plano de estudo"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem criar sprints"
 *       404:
 *         description: Plano de estudo não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Plano de estudo não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao criar sprint mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.post('/', checkPermission('administrador'), sprintController.createSprint);

/**
 * @swagger
 * /api/sprints/reordenar:
 *   post:
 *     summary: Reordenar sprints de um plano (Admin)
 *     description: Reordena as sprints mestre de um plano específico alterando suas posições. Apenas administradores podem reordenar sprints.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReordenarSprintsRequest'
 *           example:
 *             planoId: 1
 *             ordemSprints: [3, 1, 2]
 *     responses:
 *       200:
 *         description: Sprints reordenadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestreListResponse'
 *             example:
 *               - id: 3
 *                 nome: "Sprint 3 - JavaScript Avançado"
 *                 PlanoId: 1
 *                 posicao: 1
 *                 dataInicio: "2024-03-01"
 *                 dataFim: "2024-03-15"
 *                 metas: []
 *                 Plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   duracao: 90
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-20T15:45:00.000Z"
 *               - id: 1
 *                 nome: "Sprint 1 - Fundamentos HTML/CSS"
 *                 PlanoId: 1
 *                 posicao: 2
 *                 dataInicio: "2024-01-15"
 *                 dataFim: "2024-01-29"
 *                 metas: []
 *                 Plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   duracao: 90
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-20T15:45:00.000Z"
 *               - id: 2
 *                 nome: "Sprint 2 - JavaScript Básico"
 *                 PlanoId: 1
 *                 posicao: 3
 *                 dataInicio: "2024-02-01"
 *                 dataFim: "2024-02-15"
 *                 metas: []
 *                 Plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   duracao: 90
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *                 updatedAt: "2024-01-20T15:45:00.000Z"
 *       400:
 *         description: Dados inválidos ou sprints não pertencem ao plano
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Dados inválidos. planoId e ordemSprints (array) são necessários"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem reordenar sprints"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao reordenar sprints mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.post('/reordenar', checkPermission('administrador'), sprintController.reordenarSprints);

/**
 * @swagger
 * /api/sprints/{id}:
 *   get:
 *     summary: Buscar sprint mestre por ID
 *     description: Retorna os detalhes de uma sprint mestre específica com suas metas mestre e dados do plano associado.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da sprint mestre
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sprint mestre encontrada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestre'
 *             example:
 *               id: 1
 *               nome: "Sprint 1 - Fundamentos HTML/CSS"
 *               PlanoId: 1
 *               posicao: 1
 *               dataInicio: "2024-01-15"
 *               dataFim: "2024-01-29"
 *               metas:
 *                 - id: 1
 *                   disciplina: "HTML"
 *                   tipo: "teoria"
 *                   titulo: "Estrutura básica do HTML"
 *                   comandos: "Criar página HTML com estrutura básica"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                   relevancia: 5
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 1
 *               Plano:
 *                 id: 1
 *                 nome: "Plano de Desenvolvimento Web"
 *                 cargo: "Desenvolvedor Frontend"
 *                 duracao: 90
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-15T10:30:00.000Z"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       404:
 *         description: Sprint mestre não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Sprint não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao buscar sprint mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.get('/:id', sprintController.getSprintById);

/**
 * @swagger
 * /api/sprints/{id}:
 *   put:
 *     summary: Atualizar sprint mestre (Admin)
 *     description: Atualiza os dados de uma sprint mestre existente e suas metas mestre. Apenas administradores podem atualizar sprints.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da sprint mestre
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SprintMestreRequest'
 *           example:
 *             nome: "Sprint 1 - Fundamentos HTML/CSS Atualizada"
 *             dataInicio: "2024-01-20"
 *             dataFim: "2024-02-03"
 *             planoId: 1
 *             metas:
 *               - id: 1
 *                 disciplina: "HTML"
 *                 tipo: "teoria"
 *                 titulo: "Estrutura básica do HTML - Atualizada"
 *                 comandos: "Criar página HTML com estrutura básica e semântica"
 *                 link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                 relevancia: 5
 *                 posicao: 1
 *               - disciplina: "CSS"
 *                 tipo: "pratica"
 *                 titulo: "Estilização avançada com CSS"
 *                 comandos: "Aplicar estilos CSS avançados em uma página HTML"
 *                 link: "https://developer.mozilla.org/pt-BR/docs/Web/CSS"
 *                 relevancia: 4
 *                 posicao: 2
 *     responses:
 *       200:
 *         description: Sprint mestre atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestre'
 *             example:
 *               id: 1
 *               nome: "Sprint 1 - Fundamentos HTML/CSS Atualizada"
 *               PlanoId: 1
 *               posicao: 1
 *               dataInicio: "2024-01-20"
 *               dataFim: "2024-02-03"
 *               metas:
 *                 - id: 1
 *                   disciplina: "HTML"
 *                   tipo: "teoria"
 *                   titulo: "Estrutura básica do HTML - Atualizada"
 *                   comandos: "Criar página HTML com estrutura básica e semântica"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                   relevancia: 5
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 1
 *               Plano:
 *                 id: 1
 *                 nome: "Plano de Desenvolvimento Web"
 *                 cargo: "Desenvolvedor Frontend"
 *                 duracao: 90
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-20T15:45:00.000Z"
 *       400:
 *         description: Dados inválidos ou campos obrigatórios faltando
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Dados inválidos para atualização"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem atualizar sprints"
 *       404:
 *         description: Sprint mestre não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Sprint não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar sprint mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.put('/:id', checkPermission('administrador'), sprintController.updateSprint);

/**
 * @swagger
 * /api/sprints/{id}:
 *   delete:
 *     summary: Excluir sprint mestre (Admin)
 *     description: Remove uma sprint mestre e todas as suas metas mestre associadas. Apenas administradores podem excluir sprints.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da sprint mestre
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sprint mestre excluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DeleteResponse'
 *             example:
 *               message: "Sprint deletada com sucesso"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem excluir sprints"
 *       404:
 *         description: Sprint mestre não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Sprint não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao deletar sprint mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.delete('/:id', checkPermission('administrador'), sprintController.deleteSprint);

/**
 * @swagger
 * /api/sprints/metas/mestre/{id}:
 *   put:
 *     summary: Atualizar meta mestre (Admin)
 *     description: Atualiza os dados de uma meta mestre (template) específica. Apenas administradores podem atualizar metas mestre.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da meta mestre
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               disciplina:
 *                 type: string
 *                 description: Disciplina da meta
 *                 example: "HTML"
 *               tipo:
 *                 type: string
 *                 description: Tipo da meta
 *                 example: "teoria"
 *               titulo:
 *                 type: string
 *                 description: Título da meta
 *                 example: "Estrutura básica do HTML - Atualizada"
 *               comandos:
 *                 type: string
 *                 description: Comandos/instruções da meta
 *                 example: "Criar página HTML com estrutura básica e semântica"
 *               link:
 *                 type: string
 *                 description: Link de referência
 *                 example: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *               relevancia:
 *                 type: integer
 *                 description: Relevância da meta (1-5)
 *                 example: 5
 *               tempoEstudado:
 *                 type: string
 *                 description: Tempo estudado (formato HH:MM)
 *                 example: "02:30"
 *               desempenho:
 *                 type: number
 *                 description: Desempenho na meta (0-100)
 *                 example: 85.5
 *               status:
 *                 type: string
 *                 description: Status da meta
 *                 example: "Pendente"
 *               totalQuestoes:
 *                 type: integer
 *                 description: Total de questões
 *                 example: 10
 *               questoesCorretas:
 *                 type: integer
 *                 description: Questões corretas
 *                 example: 8
 *           example:
 *             disciplina: "HTML"
 *             tipo: "teoria"
 *             titulo: "Estrutura básica do HTML - Atualizada"
 *             comandos: "Criar página HTML com estrutura básica e semântica"
 *             link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *             relevancia: 5
 *             tempoEstudado: "02:30"
 *             desempenho: 85.5
 *             status: "Pendente"
 *             totalQuestoes: 10
 *             questoesCorretas: 8
 *     responses:
 *       200:
 *         description: Meta mestre atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetaMestre'
 *             example:
 *               id: 1
 *               disciplina: "HTML"
 *               tipo: "teoria"
 *               titulo: "Estrutura básica do HTML - Atualizada"
 *               comandos: "Criar página HTML com estrutura básica e semântica"
 *               link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *               relevancia: 5
 *               tempoEstudado: "02:30"
 *               desempenho: 85.5
 *               status: "Pendente"
 *               totalQuestoes: 10
 *               questoesCorretas: 8
 *               SprintId: 1
 *               posicao: 1
 *               createdAt: "2024-01-15T10:30:00.000Z"
 *               updatedAt: "2024-01-20T15:45:00.000Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Dados inválidos para atualização da meta mestre"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem atualizar metas mestre"
 *       404:
 *         description: Meta mestre não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Meta mestre não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar meta mestre"
 *               error: "Falha na conexão com o banco de dados"
 */
router.put('/metas/mestre/:id', checkPermission('administrador'), sprintController.updateMetaMestre);

/**
 * @swagger
 * /api/sprints/plano/{id}/instancias:
 *   get:
 *     summary: Buscar sprints instanciadas do plano
 *     description: Retorna as sprints instanciadas (em execução) de um plano específico com suas metas instanciadas.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único do plano
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Sprints instanciadas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SprintInstancia'
 *             example:
 *               - id: 1
 *                 nome: "Sprint 1 - Fundamentos HTML/CSS"
 *                 PlanoId: 1
 *                 posicao: 1
 *                 dataInicio: "2024-01-15"
 *                 dataFim: "2024-01-29"
 *                 status: "Em Andamento"
 *                 metas:
 *                   - id: 1
 *                     disciplina: "HTML"
 *                     tipo: "teoria"
 *                     titulo: "Estrutura básica do HTML"
 *                     comandos: "Criar página HTML com estrutura básica"
 *                     link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                     relevancia: 5
 *                     tempoEstudado: "02:30"
 *                     desempenho: 85.5
 *                     status: "Concluída"
 *                     totalQuestoes: 10
 *                     questoesCorretas: 8
 *                     posicao: 1
 *                   - id: 2
 *                     disciplina: "CSS"
 *                     tipo: "pratica"
 *                     titulo: "Estilização básica com CSS"
 *                     comandos: "Aplicar estilos CSS em uma página HTML"
 *                     link: "https://developer.mozilla.org/pt-BR/docs/Web/CSS"
 *                     relevancia: 4
 *                     tempoEstudado: "01:45"
 *                     desempenho: 0
 *                     status: "Pendente"
 *                     totalQuestoes: 0
 *                     questoesCorretas: 0
 *                     posicao: 2
 *                 Plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   descricao: "Plano completo para formação em desenvolvimento web frontend"
 *               - id: 2
 *                 nome: "Sprint 2 - JavaScript Básico"
 *                 PlanoId: 1
 *                 posicao: 2
 *                 dataInicio: "2024-02-01"
 *                 dataFim: "2024-02-15"
 *                 status: "Pendente"
 *                 metas: []
 *                 Plano:
 *                   id: 1
 *                   nome: "Plano de Desenvolvimento Web"
 *                   cargo: "Desenvolvedor Frontend"
 *                   descricao: "Plano completo para formação em desenvolvimento web frontend"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       404:
 *         description: Plano não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Plano não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Erro ao buscar sprints do plano"
 *               details: "Falha na conexão com o banco de dados"
 */
router.get('/plano/:id/instancias', sprintController.buscarSprintsInstanciadasPorPlano);

/**
 * @swagger
 * /api/sprints/{id}/metas:
 *   post:
 *     summary: Adicionar metas a sprint mestre (Admin)
 *     description: Adiciona novas metas mestre a uma sprint mestre existente através de importação em lote. Apenas administradores podem adicionar metas.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da sprint mestre
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/MetaMestreRequest'
 *           example:
 *             - disciplina: "JavaScript"
 *               tipo: "pratica"
 *               titulo: "Manipulação do DOM"
 *               comandos: "Criar interações dinâmicas com JavaScript"
 *               link: "https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model"
 *               relevancia: 5
 *               posicao: 3
 *             - disciplina: "JavaScript"
 *               tipo: "teoria"
 *               titulo: "Eventos e Listeners"
 *               comandos: "Implementar sistema de eventos em JavaScript"
 *               link: "https://developer.mozilla.org/pt-BR/docs/Web/API/EventTarget/addEventListener"
 *               relevancia: 4
 *               posicao: 4
 *     responses:
 *       201:
 *         description: Metas adicionadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SprintMestre'
 *             example:
 *               id: 1
 *               nome: "Sprint 1 - Fundamentos HTML/CSS"
 *               PlanoId: 1
 *               posicao: 1
 *               dataInicio: "2024-01-15"
 *               dataFim: "2024-01-29"
 *               metas:
 *                 - id: 1
 *                   disciplina: "HTML"
 *                   tipo: "teoria"
 *                   titulo: "Estrutura básica do HTML"
 *                   comandos: "Criar página HTML com estrutura básica"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *                   relevancia: 5
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 1
 *                 - id: 2
 *                   disciplina: "CSS"
 *                   tipo: "pratica"
 *                   titulo: "Estilização básica com CSS"
 *                   comandos: "Aplicar estilos CSS em uma página HTML"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/CSS"
 *                   relevancia: 4
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 2
 *                 - id: 3
 *                   disciplina: "JavaScript"
 *                   tipo: "pratica"
 *                   titulo: "Manipulação do DOM"
 *                   comandos: "Criar interações dinâmicas com JavaScript"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/API/Document_Object_Model"
 *                   relevancia: 5
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 3
 *                 - id: 4
 *                   disciplina: "JavaScript"
 *                   tipo: "teoria"
 *                   titulo: "Eventos e Listeners"
 *                   comandos: "Implementar sistema de eventos em JavaScript"
 *                   link: "https://developer.mozilla.org/pt-BR/docs/Web/API/EventTarget/addEventListener"
 *                   relevancia: 4
 *                   tempoEstudado: "00:00"
 *                   desempenho: 0
 *                   status: "Pendente"
 *                   totalQuestoes: 0
 *                   questoesCorretas: 0
 *                   SprintId: 1
 *                   posicao: 4
 *       400:
 *         description: Dados inválidos ou posições conflitantes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Existem posições repetidas na planilha: 3, 4. Cada meta deve ter uma posição única."
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas administradores
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas administradores podem adicionar metas"
 *       404:
 *         description: Sprint mestre não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Sprint não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao adicionar metas"
 *               error: "Falha na conexão com o banco de dados"
 */
router.post('/:id/metas', checkPermission('administrador'), sprintController.adicionarMetas);

/**
 * @swagger
 * /api/sprints/instancia/{id}/meta/{metaId}:
 *   put:
 *     summary: Atualizar meta instanciada (Aluno)
 *     description: Atualiza os dados de uma meta instanciada (em execução) e gerencia automaticamente o status da sprint. Apenas alunos podem atualizar metas instanciadas.
 *     tags: [Sprints]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único da sprint instanciada
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: path
 *         name: metaId
 *         required: true
 *         description: ID único da meta instanciada
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MetaInstanciaUpdateRequest'
 *           example:
 *             tempoEstudado: "02:30"
 *             desempenho: 85.5
 *             status: "Concluída"
 *             totalQuestoes: 10
 *             questoesCorretas: 8
 *     responses:
 *       200:
 *         description: Meta instanciada atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MetaInstancia'
 *             example:
 *               id: 1
 *               disciplina: "HTML"
 *               tipo: "teoria"
 *               titulo: "Estrutura básica do HTML"
 *               comandos: "Criar página HTML com estrutura básica"
 *               link: "https://developer.mozilla.org/pt-BR/docs/Web/HTML"
 *               relevancia: 5
 *               tempoEstudado: "02:30"
 *               desempenho: 85.5
 *               status: "Concluída"
 *               totalQuestoes: 10
 *               questoesCorretas: 8
 *               posicao: 1
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Dados inválidos para atualização da meta instanciada"
 *       401:
 *         description: Token inválido ou não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Token de acesso requerido"
 *       403:
 *         description: Acesso negado - apenas alunos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Acesso negado - apenas alunos podem atualizar metas instanciadas"
 *       404:
 *         description: Meta instanciada não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Meta instanciada não encontrada"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Erro ao atualizar meta instanciada"
 *               error: "Falha na conexão com o banco de dados"
 */
router.put('/instancia/:id/meta/:metaId', checkPermission('aluno'), sprintController.updateMetaInstancia);

module.exports = router; 