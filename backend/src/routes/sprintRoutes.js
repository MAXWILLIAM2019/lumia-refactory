const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');
const auth = require('../middleware/auth');

// Aplica o middleware de autenticação em todas as rotas
router.use(auth);

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de sprint funcionando!' });
});

// Listar todas as sprints
router.get('/', sprintController.getAllSprints);

// Criar uma nova sprint
router.post('/', sprintController.createSprint);

// Reordenar sprints de um plano
router.post('/reordenar', sprintController.reordenarSprints);

// Buscar uma sprint específica
router.get('/:id', sprintController.getSprintById);

// Atualizar uma sprint
router.put('/:id', sprintController.updateSprint);

// Excluir uma sprint
router.delete('/:id', sprintController.deleteSprint);

module.exports = router; 