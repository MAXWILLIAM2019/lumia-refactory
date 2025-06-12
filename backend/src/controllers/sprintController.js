const { SprintMestre, MetaMestre, PlanoMestre, Sprint, Meta, Plano } = require('../models');
const sequelize = require('../db');
const { Op } = require('sequelize');

/**
 * Controller de SprintMestre
 * Gerencia todas as operações relacionadas a sprints mestre e suas metas mestre
 */

/**
 * Cria uma nova sprint mestre com suas metas mestre
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados da sprint
 * @param {string} req.body.nome - Nome da sprint
 * @param {number} req.body.planoId - ID do plano mestre associado
 * @param {Array} req.body.metas - Lista de metas da sprint
 * @param {Object} res - Resposta HTTP
 */
exports.createSprint = async (req, res) => {
  try {
    // Log do header Authorization
    console.log('Authorization header recebido (cadastrar sprint mestre):', req.header('Authorization'));
    const { nome, dataInicio, dataFim, planoId, metas } = req.body;

    // Verificar se o planoId foi fornecido
    if (!planoId) {
      return res.status(400).json({ message: 'É necessário associar a sprint a um plano de estudo' });
    }

    // Verificar se o plano mestre existe
    const planoMestre = await PlanoMestre.findByPk(planoId);
    if (!planoMestre) {
      return res.status(404).json({ message: 'Plano de estudo não encontrado' });
    }

    // Determinar a próxima posição disponível para este plano mestre
    const ultimaSprintMestre = await SprintMestre.findOne({
      where: { PlanoMestreId: planoId },
      order: [['posicao', 'DESC']]
    });
    
    const proximaPosicao = ultimaSprintMestre ? ultimaSprintMestre.posicao + 1 : 1;

    // Criar a sprint mestre
    const sprintMestre = await SprintMestre.create({
      nome,
      dataInicio: dataInicio || null,
      dataFim: dataFim || null,
      PlanoMestreId: planoId,
      posicao: proximaPosicao
    });

    // Criar as metas mestre associadas à sprint mestre
    if (metas && metas.length > 0) {
      const metasMestresCriadas = await Promise.all(
        metas.map(meta => 
          MetaMestre.create({
            disciplina: meta.disciplina,
            tipo: meta.tipo,
            titulo: meta.titulo,
            comandos: meta.comandos,
            link: meta.link,
            relevancia: meta.relevancia,
            tempoEstudado: meta.tempoEstudado || '00:00',
            desempenho: meta.desempenho || 0,
            status: meta.status || 'Pendente',
            totalQuestoes: meta.totalQuestoes || 0,
            questoesCorretas: meta.questoesCorretas || 0,
            SprintMestreId: sprintMestre.id
          })
        )
      );
      
      // Adicionar as metas ao objeto de resposta para compatibilidade
      sprintMestre.metas = metasMestresCriadas.map(metaMestre => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestre.id // Para compatibilidade com frontend
      }));
    }

    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: planoId, // Para compatibilidade com frontend
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio, // Agora aceita datas diretamente
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metas || [],
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    };

    res.status(201).json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao criar sprint mestre:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Busca todas as sprints mestre com suas metas mestre
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
exports.getAllSprints = async (req, res) => {
  try {
    const sprintsMestre = await SprintMestre.findAll({
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre'
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ],
      order: [
        ['PlanoMestreId', 'ASC'],
        ['posicao', 'ASC']
      ]
    });

    // Transformar para formato esperado pelo frontend
    const sprintsFormatadas = sprintsMestre.map(sprintMestre => ({
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: sprintMestre.PlanoMestreId, // Para compatibilidade
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio,
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre?.map(metaMestre => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestre.id
      })) || [],
      Plano: sprintMestre.planoMestre ? {
        id: sprintMestre.planoMestre.id,
        nome: sprintMestre.planoMestre.nome,
        cargo: sprintMestre.planoMestre.cargo,
        duracao: sprintMestre.planoMestre.duracao
      } : null,
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    }));
    
    res.json(sprintsFormatadas);
  } catch (error) {
    console.error('Erro ao buscar sprints mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Busca uma sprint mestre específica com suas metas mestre
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID da sprint mestre
 * @param {Object} res - Resposta HTTP
 */
exports.getSprintById = async (req, res) => {
  try {
    const sprintMestre = await SprintMestre.findByPk(req.params.id, {
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre',
          order: [['id', 'ASC']]
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });
    
    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }
    
    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintMestre.id,
      nome: sprintMestre.nome,
             PlanoId: sprintMestre.PlanoMestreId,
       posicao: sprintMestre.posicao,
       dataInicio: sprintMestre.dataInicio,
       dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre?.map(metaMestre => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestre.id
      })) || [],
      Plano: sprintMestre.planoMestre ? {
        id: sprintMestre.planoMestre.id,
        nome: sprintMestre.planoMestre.nome,
        cargo: sprintMestre.planoMestre.cargo,
        duracao: sprintMestre.planoMestre.duracao
      } : null,
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    };
    
    res.json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao buscar sprint mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Função removida: atualizarStatusSprint
 * 
 * Esta função não se aplica aos templates (sprints mestre),
 * pois os templates não têm status de progresso.
 * 
 * O status será calculado apenas nas instâncias de sprint do aluno (feature futura).
 */

// Atualizar uma sprint mestre e suas metas mestre
exports.updateSprint = async (req, res) => {
  try {
    const { nome, dataInicio, dataFim, planoId, metas } = req.body;
    
    const sprintMestre = await SprintMestre.findByPk(req.params.id);
    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Verificar se o plano mestre existe, se um ID foi fornecido
    if (planoId) {
      const planoMestre = await PlanoMestre.findByPk(planoId);
      if (!planoMestre) {
        return res.status(404).json({ message: 'Plano de estudo não encontrado' });
      }
    }

    // Atualizar dados da sprint mestre
    await sprintMestre.update({
      nome,
      dataInicio: dataInicio !== undefined ? dataInicio : sprintMestre.dataInicio,
      dataFim: dataFim !== undefined ? dataFim : sprintMestre.dataFim,
      PlanoMestreId: planoId || sprintMestre.PlanoMestreId
    });

    // Atualizar metas mestre (simplificado para templates)
    if (metas) {
      // Buscar metas mestre existentes
      const metasMestreExistentes = await MetaMestre.findAll({
        where: { SprintMestreId: sprintMestre.id }
      });

      // Mapear metas existentes por ID para fácil acesso
      const metasExistentesMap = new Map(
        metasMestreExistentes.map(meta => [meta.id, meta])
      );

      // Array para armazenar os IDs das metas que serão mantidas
      const idsMetasManter = [];

      // Processar cada meta da requisição
      for (const meta of metas) {
        if (meta.id && metasExistentesMap.has(meta.id)) {
          // Se a meta mestre já existe, atualizar
          const metaExistente = metasExistentesMap.get(meta.id);
          await metaExistente.update({
            disciplina: meta.disciplina,
            tipo: meta.tipo,
            titulo: meta.titulo,
            comandos: meta.comandos,
            link: meta.link,
            relevancia: meta.relevancia,
            tempoEstudado: meta.tempoEstudado !== undefined ? meta.tempoEstudado : metaExistente.tempoEstudado,
            desempenho: meta.desempenho !== undefined ? meta.desempenho : metaExistente.desempenho,
            status: meta.status !== undefined ? meta.status : metaExistente.status,
            totalQuestoes: meta.totalQuestoes !== undefined ? meta.totalQuestoes : metaExistente.totalQuestoes,
            questoesCorretas: meta.questoesCorretas !== undefined ? meta.questoesCorretas : metaExistente.questoesCorretas
          });
          idsMetasManter.push(meta.id);
        } else if (!meta.id) {
          // Se é uma nova meta mestre (sem ID), criar
          const novaMetaMestre = await MetaMestre.create({
            disciplina: meta.disciplina,
            tipo: meta.tipo,
            titulo: meta.titulo,
            comandos: meta.comandos,
            link: meta.link,
            relevancia: meta.relevancia,
            tempoEstudado: meta.tempoEstudado || '00:00',
            desempenho: meta.desempenho || 0,
            status: meta.status || 'Pendente',
            totalQuestoes: meta.totalQuestoes || 0,
            questoesCorretas: meta.questoesCorretas || 0,
            SprintMestreId: sprintMestre.id
          });
          idsMetasManter.push(novaMetaMestre.id);
        }
      }

      // Remover apenas as metas que não estão mais presentes na requisição
      if (idsMetasManter.length > 0) {
        await MetaMestre.destroy({
          where: {
            SprintMestreId: sprintMestre.id,
            id: {
              [Op.notIn]: idsMetasManter
            }
          }
        });
      }
    }

    // Buscar sprint mestre atualizada com metas mestre
    const sprintMestreAtualizada = await SprintMestre.findByPk(sprintMestre.id, {
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre'
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });

    // Transformar para formato esperado pelo frontend
    const sprintFormatada = {
      id: sprintMestreAtualizada.id,
      nome: sprintMestreAtualizada.nome,
      PlanoId: sprintMestreAtualizada.PlanoMestreId,
      posicao: sprintMestreAtualizada.posicao,
      dataInicio: sprintMestreAtualizada.dataInicio,
      dataFim: sprintMestreAtualizada.dataFim,
      metas: sprintMestreAtualizada.metasMestre?.map(metaMestre => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestreAtualizada.id
      })) || [],
      Plano: sprintMestreAtualizada.planoMestre ? {
        id: sprintMestreAtualizada.planoMestre.id,
        nome: sprintMestreAtualizada.planoMestre.nome,
        cargo: sprintMestreAtualizada.planoMestre.cargo,
        duracao: sprintMestreAtualizada.planoMestre.duracao
      } : null,
      createdAt: sprintMestreAtualizada.createdAt,
      updatedAt: sprintMestreAtualizada.updatedAt
    };

    res.json(sprintFormatada);
  } catch (error) {
    console.error('Erro ao atualizar sprint:', error);
    res.status(400).json({ message: error.message });
  }
};

// Deletar uma sprint mestre e suas metas mestre
exports.deleteSprint = async (req, res) => {
  try {
    const sprintMestre = await SprintMestre.findByPk(req.params.id);
    if (!sprintMestre) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Deletar metas mestre associadas
    await MetaMestre.destroy({
      where: { SprintMestreId: sprintMestre.id }
    });

    // Deletar sprint mestre
    await sprintMestre.destroy();

    res.json({ message: 'Sprint deletada com sucesso' });
  }
  catch (error) {
    console.error('Erro ao deletar sprint mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Reordena as sprints mestre de um plano mestre
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição
 * @param {number} req.body.planoId - ID do plano mestre
 * @param {Array<number>} req.body.ordemSprints - Array com IDs das sprints mestre na nova ordem
 * @param {Object} res - Resposta HTTP
 */
exports.reordenarSprints = async (req, res) => {
  const { planoId, ordemSprints } = req.body;
  
  if (!planoId || !ordemSprints || !Array.isArray(ordemSprints) || ordemSprints.length === 0) {
    return res.status(400).json({ message: 'Dados inválidos. planoId e ordemSprints (array) são necessários' });
  }
  
  try {
    const planoMestre = await PlanoMestre.findByPk(planoId);
    if (!planoMestre) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Verificar se todas as sprints mestre pertencem ao plano mestre
    const sprintsMestre = await SprintMestre.findAll({
      where: { PlanoMestreId: planoId }
    });
    
    const sprintMestreIds = sprintsMestre.map(s => s.id);
    
    for (const id of ordemSprints) {
      if (!sprintMestreIds.includes(id)) {
        return res.status(400).json({ 
          message: `Sprint com ID ${id} não pertence ao plano ${planoId}` 
        });
      }
    }
    
    // Verificar se todos os IDs de sprints mestre do plano estão na ordemSprints
    if (new Set([...sprintMestreIds]).size !== new Set([...ordemSprints]).size) {
      return res.status(400).json({ 
        message: 'A lista de sprints fornecida não contém todas as sprints do plano'
      });
    }
    
    // Atualizar posições em uma transação para garantir consistência
    await sequelize.transaction(async (t) => {
      for (let i = 0; i < ordemSprints.length; i++) {
        await SprintMestre.update(
          { posicao: i + 1 },
          { 
            where: { id: ordemSprints[i] },
            transaction: t
          }
        );
      }
    });
    
    // Retornar as sprints mestre reordenadas (formatadas para frontend)
    const sprintsMestreAtualizadas = await SprintMestre.findAll({
      where: { PlanoMestreId: planoId },
      order: [['posicao', 'ASC']],
      include: [
        {
          model: MetaMestre,
          as: 'metasMestre'
        },
        {
          model: PlanoMestre,
          as: 'planoMestre',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ]
    });

    // Transformar para formato esperado pelo frontend
    const sprintsFormatadas = sprintsMestreAtualizadas.map(sprintMestre => ({
      id: sprintMestre.id,
      nome: sprintMestre.nome,
      PlanoId: sprintMestre.PlanoMestreId,
      posicao: sprintMestre.posicao,
      dataInicio: sprintMestre.dataInicio,
      dataFim: sprintMestre.dataFim,
      metas: sprintMestre.metasMestre?.map(metaMestre => ({
        id: metaMestre.id,
        disciplina: metaMestre.disciplina,
        tipo: metaMestre.tipo,
        titulo: metaMestre.titulo,
        comandos: metaMestre.comandos,
        link: metaMestre.link,
        relevancia: metaMestre.relevancia,
        tempoEstudado: metaMestre.tempoEstudado,
        desempenho: metaMestre.desempenho,
        status: metaMestre.status,
        totalQuestoes: metaMestre.totalQuestoes,
        questoesCorretas: metaMestre.questoesCorretas,
        SprintId: sprintMestre.id
      })) || [],
      Plano: sprintMestre.planoMestre ? {
        id: sprintMestre.planoMestre.id,
        nome: sprintMestre.planoMestre.nome,
        cargo: sprintMestre.planoMestre.cargo,
        duracao: sprintMestre.planoMestre.duracao
      } : null,
      createdAt: sprintMestre.createdAt,
      updatedAt: sprintMestre.updatedAt
    }));
    
    res.json(sprintsFormatadas);
  } catch (error) {
    console.error('Erro ao reordenar sprints mestre:', error);
    res.status(500).json({ message: error.message });
  }
};

// Atualizar uma meta mestre
exports.updateMeta = async (req, res) => {
  try {
    const metaMestre = await MetaMestre.findByPk(req.params.id);
    if (!metaMestre) {
      return res.status(404).json({ message: 'Meta não encontrada' });
    }

    const { disciplina, tipo, titulo, comandos, link, relevancia, tempoEstudado, desempenho, status, totalQuestoes, questoesCorretas } = req.body;

    await metaMestre.update({
      disciplina,
      tipo,
      titulo,
      comandos,
      link,
      relevancia,
      tempoEstudado: tempoEstudado !== undefined ? tempoEstudado : metaMestre.tempoEstudado,
      desempenho: desempenho !== undefined ? desempenho : metaMestre.desempenho,
      status: status !== undefined ? status : metaMestre.status,
      totalQuestoes: totalQuestoes !== undefined ? totalQuestoes : metaMestre.totalQuestoes,
      questoesCorretas: questoesCorretas !== undefined ? questoesCorretas : metaMestre.questoesCorretas
    });

    // Transformar para formato esperado pelo frontend
    const metaFormatada = {
      id: metaMestre.id,
      disciplina: metaMestre.disciplina,
      tipo: metaMestre.tipo,
      titulo: metaMestre.titulo,
      comandos: metaMestre.comandos,
      link: metaMestre.link,
      relevancia: metaMestre.relevancia,
      tempoEstudado: metaMestre.tempoEstudado,
      desempenho: metaMestre.desempenho,
      status: metaMestre.status,
      totalQuestoes: metaMestre.totalQuestoes,
      questoesCorretas: metaMestre.questoesCorretas,
      SprintId: metaMestre.SprintMestreId, // Para compatibilidade com frontend
      createdAt: metaMestre.createdAt,
      updatedAt: metaMestre.updatedAt
    };

    res.json(metaFormatada);
  } catch (error) {
    console.error('Erro ao atualizar meta mestre:', error);
    res.status(400).json({ message: error.message });
  }
}; 