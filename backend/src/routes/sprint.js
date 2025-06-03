const express = require('express');
const sprintController = require('../controllers/sprintController');
const Sprint = require('../models/Sprint');
const Meta = require('../models/Meta');

const router = express.Router();

// Listar todas as sprints
router.get('/', async (req, res) => {
  const sprints = await Sprint.findAll();
  res.json(sprints);
});

// Criar uma nova sprint
router.post('/', async (req, res) => {
  const { nome, dataInicio, dataFim } = req.body;
  const sprint = await Sprint.create({ nome, dataInicio, dataFim });
  res.status(201).json(sprint);
});

// Buscar uma sprint específica
router.get('/:id', async (req, res) => {
  const sprint = await Sprint.findByPk(req.params.id);
  if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });
  res.json(sprint);
});

// Atualizar uma sprint
router.put('/:id', async (req, res) => {
  const sprint = await Sprint.findByPk(req.params.id);
  if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });
  const { nome, dataInicio, dataFim } = req.body;
  await sprint.update({ nome, dataInicio, dataFim });
  res.json(sprint);
});

// Deletar uma sprint
router.delete('/:id', async (req, res) => {
  const sprint = await Sprint.findByPk(req.params.id);
  if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });
  await sprint.destroy();
  res.json({ success: true });
});

// Listar metas de uma sprint
router.get('/:id/metas', async (req, res) => {
  const sprint = await Sprint.findByPk(req.params.id, {
    include: { model: Meta, as: 'metas' }
  });
  if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });
  res.json(sprint.metas);
});

// Atualizar uma meta
router.put('/metas/:id', sprintController.updateMeta);

module.exports = router; 