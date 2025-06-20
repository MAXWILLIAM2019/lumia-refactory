const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');
const { auth } = require('../middleware/auth');
const { checkPermission } = require('../middleware/checkPermission');

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de sprint funcionando!' });
});

// Listar todas as sprints (admin e aluno podem ver)
router.get('/', sprintController.getAllSprints);

// Criar uma nova sprint (apenas admin)
router.post('/', checkPermission('administrador'), sprintController.createSprint);

// Reordenar sprints de um plano (apenas admin)
router.post('/reordenar', checkPermission('administrador'), sprintController.reordenarSprints);

// Buscar uma sprint específica (admin e aluno podem ver)
router.get('/:id', sprintController.getSprintById);

// Atualizar uma sprint (apenas admin)
router.put('/:id', checkPermission('administrador'), sprintController.updateSprint);

// Excluir uma sprint (apenas admin)
router.delete('/:id', checkPermission('administrador'), sprintController.deleteSprint);

// Atualizar uma meta mestre (apenas admin)
router.put('/metas/mestre/:id', checkPermission('administrador'), sprintController.updateMetaMestre);

// Buscar sprints instanciadas de um plano (admin e aluno podem ver)
router.get('/plano/:id/instancias', sprintController.buscarSprintsInstanciadasPorPlano);

// Adicionar metas a uma sprint (admin e aluno podem adicionar)
router.post('/:id/metas', sprintController.adicionarMetas);

/**
 * ATENÇÃO: Rota utilizada no módulo do aluno (Visualização de Metas)
 * NÃO ALTERAR sem consultar o time de desenvolvimento
 * 
 * Atualiza uma meta instanciada (apenas aluno)
 * Esta rota é específica para instâncias e é usada apenas na interface do aluno
 * 
 * IMPORTANTE:
 * - Anteriormente existia a rota PUT /metas/instancia/:id que foi substituída por esta
 * - A mudança foi feita para seguir padrões REST (hierarquia sprint -> meta)
 * - O frontend foi atualizado para usar esta nova rota
 * - Não adicionar a rota antiga de volta sem discussão com a equipe
 */
router.put('/instancia/:id/meta/:metaId', checkPermission('aluno'), sprintController.updateMetaInstancia);

module.exports = router; 