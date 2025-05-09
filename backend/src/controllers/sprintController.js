const Sprint = require('../models/Sprint');
const Atividade = require('../models/Atividade');

/**
 * Controller de Sprint
 * Gerencia todas as operações relacionadas a sprints e suas atividades
 */

/**
 * Cria uma nova sprint com suas atividades
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados da sprint
 * @param {string} req.body.nome - Nome da sprint
 * @param {string} req.body.dataInicio - Data de início
 * @param {string} req.body.dataFim - Data de término
 * @param {Array} req.body.atividades - Lista de atividades da sprint
 * @param {Object} res - Resposta HTTP
 */
exports.createSprint = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, atividades } = req.body;

    // Criar a sprint
    const sprint = await Sprint.create({
      nome,
      dataInicio,
      dataFim
    });

    // Criar as atividades associadas à sprint
    if (atividades && atividades.length > 0) {
      const atividadesCriadas = await Promise.all(
        atividades.map(atividade => 
          Atividade.create({
            ...atividade,
            SprintId: sprint.id
          })
        )
      );
      sprint.atividades = atividadesCriadas;
    }

    res.status(201).json(sprint);
  } catch (error) {
    console.error('Erro ao criar sprint:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Busca todas as sprints com suas atividades
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.findAll({
      include: [{
        model: Atividade,
        as: 'atividades'
      }],
      order: [['createdAt', 'DESC']]
    });
    res.json(sprints);
  } catch (error) {
    console.error('Erro ao buscar sprints:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Busca uma sprint específica com suas atividades
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID da sprint
 * @param {Object} res - Resposta HTTP
 */
exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [{
        model: Atividade,
        as: 'atividades'
      }]
    });
    
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }
    
    res.json(sprint);
  } catch (error) {
    console.error('Erro ao buscar sprint:', error);
    res.status(500).json({ message: error.message });
  }
};

// Atualizar uma sprint e suas atividades
exports.updateSprint = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, atividades } = req.body;
    
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Atualizar dados da sprint
    await sprint.update({
      nome,
      dataInicio,
      dataFim
    });

    // Atualizar atividades
    if (atividades) {
      // Remover atividades antigas
      await Atividade.destroy({
        where: { SprintId: sprint.id }
      });

      // Criar novas atividades
      await Promise.all(
        atividades.map(atividade =>
          Atividade.create({
            ...atividade,
            SprintId: sprint.id
          })
        )
      );
    }

    // Buscar sprint atualizada com atividades
    const sprintAtualizada = await Sprint.findByPk(sprint.id, {
      include: [{
        model: Atividade,
        as: 'atividades'
      }]
    });

    res.json(sprintAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletar uma sprint e suas atividades
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Deletar atividades associadas
    await Atividade.destroy({
      where: { SprintId: sprint.id }
    });

    // Deletar sprint
    await sprint.destroy();

    res.json({ message: 'Sprint deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 