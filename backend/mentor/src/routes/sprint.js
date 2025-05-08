const express = require('express');
const Sprint = require('../models/Sprint');
const Atividade = require('../models/Atividade');

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

// Listar atividades de uma sprint
router.get('/:id/atividades', async (req, res) => {
  const sprint = await Sprint.findByPk(req.params.id, {
    include: { model: Atividade, as: 'atividades' }
  });
  if (!sprint) return res.status(404).json({ error: 'Sprint não encontrada' });
  res.json(sprint.atividades);
});

module.exports = router; 