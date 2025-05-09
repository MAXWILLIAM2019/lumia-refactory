const express = require('express');
const router = express.Router();
const sprintController = require('../controllers/sprintController');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de sprint funcionando!' });
});

// Listar todas as sprints
router.get('/', sprintController.getAllSprints);

// Criar nova sprint
router.post('/', sprintController.createSprint);

// Rotas para Sprint
router.get('/:id', sprintController.getSprintById);
router.put('/:id', sprintController.updateSprint);
router.delete('/:id', sprintController.deleteSprint);

module.exports = router; 