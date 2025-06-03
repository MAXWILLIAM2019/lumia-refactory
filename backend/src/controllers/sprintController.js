const Sprint = require('../models/Sprint');
const Meta = require('../models/Meta');
const Plano = require('../models/Plano');
const sequelize = require('../db');
const { Op } = require('sequelize');

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
 * @param {number} req.body.planoId - ID do plano associado
 * @param {Array} req.body.metas - Lista de metas da sprint
 * @param {Object} res - Resposta HTTP
 */
exports.createSprint = async (req, res) => {
  try {
    // Log do header Authorization
    console.log('Authorization header recebido (cadastrar sprint):', req.header('Authorization'));
    const { nome, dataInicio, dataFim, planoId, metas } = req.body;

    // Verificar se o planoId foi fornecido
    if (!planoId) {
      return res.status(400).json({ message: 'É necessário associar a sprint a um plano de estudo' });
    }

    // Verificar se o plano existe
    const plano = await Plano.findByPk(planoId);
    if (!plano) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    // Determinar a próxima posição disponível para este plano
    const ultimaSprint = await Sprint.findOne({
      where: { PlanoId: planoId },
      order: [['posicao', 'DESC']]
    });
    
    const proximaPosicao = ultimaSprint ? ultimaSprint.posicao + 1 : 1;

    // Criar a sprint
    const sprint = await Sprint.create({
      nome,
      dataInicio,
      dataFim,
      PlanoId: planoId,
      posicao: proximaPosicao
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
      include: [
        {
          model: Meta,
          as: 'metas'
        },
        {
          model: Plano,
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ],
      order: [
        ['PlanoId', 'ASC'],
        ['posicao', 'ASC']
      ]
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
      include: [
        {
          model: Meta,
          as: 'metas',
          order: [['id', 'ASC']]
        },
        {
          model: Plano,
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
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

/**
 * Atualiza o status da sprint baseado no status das metas
 * @param {number} sprintId - ID da sprint
 */
const atualizarStatusSprint = async (sprintId) => {
  const sprint = await Sprint.findByPk(sprintId, {
    include: [{ model: Meta, as: 'metas' }]
  });

  if (!sprint || !sprint.metas) return;

  const totalMetas = sprint.metas.length;
  const metasConcluidas = sprint.metas.filter(meta => meta.status === 'Concluída').length;

  let novoStatus;
  if (metasConcluidas === 0) {
    novoStatus = 'Pendente';
  } else if (metasConcluidas === totalMetas) {
    novoStatus = 'Concluída';
  } else {
    novoStatus = 'Em Andamento';
  }

  if (sprint.status !== novoStatus) {
    await sprint.update({ status: novoStatus });
  }
};

// Atualizar uma sprint e suas metas
exports.updateSprint = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, planoId, metas } = req.body;
    
    const sprint = await Sprint.findByPk(req.params.id);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Verificar se o plano existe, se um ID foi fornecido
    if (planoId) {
      const plano = await Plano.findByPk(planoId);
      if (!plano) {
        return res.status(404).json({ message: 'Plano de estudo não encontrado' });
      }
    }

    // Atualizar dados da sprint
    await sprint.update({
      nome,
      dataInicio,
      dataFim,
      PlanoId: planoId || sprint.PlanoId
    });

    // Atualizar metas
    if (metas) {
      // Buscar metas existentes para preservar dados de evolução
      const metasExistentes = await Meta.findAll({
        where: { SprintId: sprint.id }
      });

      // Mapear metas existentes por ID para fácil acesso
      const metasExistentesMap = new Map(
        metasExistentes.map(meta => [meta.id, meta])
      );

      // Array para armazenar os IDs das metas que serão mantidas
      const idsMetasManter = [];

      // Processar cada meta da requisição
      for (const meta of metas) {
        if (meta.id && metasExistentesMap.has(meta.id)) {
          // Se a meta já existe, atualizar preservando dados de evolução
          const metaExistente = metasExistentesMap.get(meta.id);
          await metaExistente.update({
            disciplina: meta.disciplina,
            tipo: meta.tipo,
            titulo: meta.titulo,
            descricao: meta.descricao,
            relevancia: meta.relevancia,
            comando: meta.comando,
            link: meta.link,
            // Preservar dados de evolução
            status: metaExistente.status,
            tempoEstudado: metaExistente.tempoEstudado,
            desempenho: metaExistente.desempenho,
            totalQuestoes: metaExistente.totalQuestoes,
            questoesCorretas: metaExistente.questoesCorretas
          });
          idsMetasManter.push(meta.id);
        } else if (!meta.id) {
          // Se é uma nova meta (sem ID), criar
          const novaMeta = await Meta.create({
            ...meta,
            SprintId: sprint.id,
            status: 'Pendente',
            tempoEstudado: '00:00',
            desempenho: 0,
            totalQuestoes: 0,
            questoesCorretas: 0
          });
          idsMetasManter.push(novaMeta.id);
        }
      }

      // Remover apenas as metas que não estão mais presentes na requisição
      if (idsMetasManter.length > 0) {
        await Meta.destroy({
          where: {
            SprintId: sprint.id,
            id: {
              [Op.notIn]: idsMetasManter
            }
          }
        });
      }
    }

    // Buscar sprint atualizada com metas
    const sprintAtualizada = await Sprint.findByPk(sprint.id, {
      include: [
        {
          model: Meta,
          as: 'metas'
        },
        {
          model: Plano,
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });

    // Atualizar status da sprint após atualizar as metas
    await atualizarStatusSprint(sprint.id);

    res.json(sprintAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar sprint:', error);
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
  }
  catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reordena as sprints de um plano
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição
 * @param {number} req.body.planoId - ID do plano
 * @param {Array<number>} req.body.ordemSprints - Array com IDs das sprints na nova ordem
 * @param {Object} res - Resposta HTTP
 */
exports.reordenarSprints = async (req, res) => {
  const { planoId, ordemSprints } = req.body;
  
  console.log('Dados recebidos para reordenação:', { planoId, ordemSprints });
  
  if (!planoId || !ordemSprints || !Array.isArray(ordemSprints) || ordemSprints.length === 0) {
    console.log('Dados inválidos recebidos');
    return res.status(400).json({ message: 'Dados inválidos. planoId e ordemSprints (array) são necessários' });
  }
  
  try {
    console.log('Buscando plano:', planoId);
    const plano = await Plano.findByPk(planoId);
    if (!plano) {
      console.log('Plano não encontrado:', planoId);
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    console.log('Buscando sprints do plano');
    const sprints = await Sprint.findAll({
      where: { PlanoId: planoId }
    });
    
    console.log('Sprints encontradas:', sprints.map(s => ({ id: s.id, nome: s.nome, status: s.status })));
    
    const sprintIds = sprints.map(s => s.id);
    
    // Verificar se todos os IDs de sprints do plano estão na ordemSprints
    if (new Set([...sprintIds]).size !== new Set([...ordemSprints]).size) {
      console.log('Lista de sprints incompleta');
      return res.status(400).json({ 
        message: 'A lista de sprints fornecida não contém todas as sprints do plano'
      });
    }
    
    // Mapeia a ordem desejada para cada sprint
    const posicaoPorId = {};
    ordemSprints.forEach((id, idx) => {
      posicaoPorId[id] = idx + 1;
    });

    // Verifica se a ordem relativa das sprints não pendentes mudou
    const ordemOriginalNaoPendentes = sprints
      .filter(s => s.status !== 'Pendente')
      .sort((a, b) => a.posicao - b.posicao)
      .map(s => s.id);

    const ordemNovaNaoPendentes = ordemSprints
      .map(id => sprints.find(s => s.id === id))
      .filter(s => s && s.status !== 'Pendente')
      .map(s => s.id);

    const ordemIgual = JSON.stringify(ordemOriginalNaoPendentes) === JSON.stringify(ordemNovaNaoPendentes);

    if (!ordemIgual) {
      return res.status(400).json({
        message: 'Não é permitido alterar a posição de sprints já iniciadas ou concluídas.',
        sprintsBloqueadas: sprints.filter(s => s.status !== 'Pendente')
      });
    }

    console.log('Iniciando transação para atualizar posições apenas das pendentes');
    // Só atualiza a posição das pendentes
    await sequelize.transaction(async (t) => {
      for (const sprint of sprints) {
        if (sprint.status === 'Pendente') {
          await Sprint.update(
            { posicao: posicaoPorId[sprint.id] },
            { where: { id: sprint.id }, transaction: t }
          );
        }
      }
    });
    
    console.log('Buscando sprints atualizadas');
    // Retornar as sprints reordenadas
    const sprintsAtualizadas = await Sprint.findAll({
      where: { PlanoId: planoId },
      order: [['posicao', 'ASC']],
      include: [
        {
          model: Meta,
          as: 'metas'
        },
        {
          model: Plano,
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });
    
    console.log('Reordenação concluída com sucesso');
    res.json(sprintsAtualizadas);
  } catch (error) {
    console.error('Erro detalhado ao reordenar sprints:', error);
    res.status(500).json({ message: error.message });
  }
};

// Atualizar uma meta
exports.updateMeta = async (req, res) => {
  try {
    const meta = await Meta.findByPk(req.params.id);
    if (!meta) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    const { status, tempoEstudado, desempenho, totalQuestoes, questoesCorretas } = req.body;

    await meta.update({
      status,
      tempoEstudado,
      desempenho,
      totalQuestoes,
      questoesCorretas
    });

    // Atualizar status da sprint após atualizar a meta
    await atualizarStatusSprint(meta.SprintId);

    res.json(meta);
  } catch (error) {
    console.error('Erro ao atualizar meta:', error);
    res.status(400).json({ message: error.message });
  }
}; 