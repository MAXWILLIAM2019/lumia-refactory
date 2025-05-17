const Sprint = require('../models/Sprint');
const Meta = require('../models/Meta');

/**
 * Controller de Sprint
 * Gerencia todas as operações relacionadas a sprints e suas metas
 */

/**
 * Cria uma nova sprint com suas metas
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados da sprint
 * @param {string} req.body.nome - Nome da sprint
 * @param {string} req.body.dataInicio - Data de início
 * @param {string} req.body.dataFim - Data de término
 * @param {Array} req.body.metas - Lista de metas da sprint
 * @param {Object} res - Resposta HTTP
 */
exports.createSprint = async (req, res) => {
  try {
    // Log do header Authorization
    console.log('Authorization header recebido (cadastrar sprint):', req.header('Authorization'));
    const { nome, dataInicio, dataFim, metas } = req.body;

    // Criar a sprint
    const sprint = await Sprint.create({
      nome,
      dataInicio,
      dataFim
    });

    // Criar as metas associadas à sprint
    if (metas && metas.length > 0) {
      const metasCriadas = await Promise.all(
        metas.map(meta => 
          Meta.create({
            ...meta,
            SprintId: sprint.id
          })
        )
      );
      sprint.metas = metasCriadas;
    }

    res.status(201).json(sprint);
  } catch (error) {
    console.error('Erro ao criar sprint:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Busca todas as sprints com suas metas
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
exports.getAllSprints = async (req, res) => {
  try {
    const sprints = await Sprint.findAll({
      include: [{
        model: Meta,
        as: 'metas'
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
 * Busca uma sprint específica com suas metas
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID da sprint
 * @param {Object} res - Resposta HTTP
 */
exports.getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id, {
      include: [{
        model: Meta,
        as: 'metas'
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

// Atualizar uma sprint e suas metas
exports.updateSprint = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, metas } = req.body;
    
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

    // Atualizar metas
    if (metas) {
      // Remover metas antigas
      await Meta.destroy({
        where: { SprintId: sprint.id }
      });

      // Criar novas metas
      await Promise.all(
        metas.map(meta =>
          Meta.create({
            ...meta,
            SprintId: sprint.id
          })
        )
      );
    }

    // Buscar sprint atualizada com metas
    const sprintAtualizada = await Sprint.findByPk(sprint.id, {
      include: [{
        model: Meta,
        as: 'metas'
      }]
    });

    res.json(sprintAtualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletar uma sprint e suas metas
exports.deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Deletar metas associadas
    await Meta.destroy({
      where: { SprintId: sprint.id }
    });

    // Deletar sprint
    await sprint.destroy();

    res.json({ message: 'Sprint deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 