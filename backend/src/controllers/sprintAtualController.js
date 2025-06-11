const SprintAtual = require('../models/SprintAtual');
const Sprint = require('../models/Sprint');
const Aluno = require('../models/Aluno');
const Plano = require('../models/Plano');
const AlunoPlano = require('../models/AlunoPlano');
const Meta = require('../models/Meta');

/**
 * Busca a sprint atual do aluno
 */
exports.getSprintAtual = async (req, res) => {
  try {
    console.log('========== BUSCANDO SPRINT ATUAL ==========');
    const idusuario = req.aluno.id;
    console.log('ID do usuário:', idusuario);

    // Primeiro, buscar o plano do usuário
    const alunoPlano = await AlunoPlano.findOne({
      where: { IdUsuario: idusuario },
      include: [{
        model: Plano,
        as: 'plano',
        include: [{
          model: Sprint,
          as: 'sprints',
          include: [{
            model: Meta,
            as: 'metas'
          }]
        }]
      }]
    });

    if (!alunoPlano || !alunoPlano.plano || !alunoPlano.plano.sprints || alunoPlano.plano.sprints.length === 0) {
      return res.status(404).json({ message: 'Usuário não possui plano de estudo com sprints' });
    }

    // Ordenar as sprints por posição
    const sprintsOrdenadas = alunoPlano.plano.sprints.sort((a, b) => a.posicao - b.posicao);
    const primeiraSprint = sprintsOrdenadas[0];

    // Buscar a sprint atual do usuário
    let sprintAtual = await SprintAtual.findOne({
      where: { idusuario },
      include: [{
        model: Sprint,
        include: [{
          model: Meta,
          as: 'metas'
        }]
      }]
    });

    // Se não existir sprint atual, criar com a primeira sprint do plano
    if (!sprintAtual) {
      sprintAtual = await SprintAtual.create({
        idusuario,
        SprintId: primeiraSprint.id
      });

      // Buscar a sprint completa com suas metas
      const sprintCompleta = await Sprint.findByPk(primeiraSprint.id, {
        include: [{
          model: Meta,
          as: 'metas'
        }]
      });

      return res.json(sprintCompleta);
    }

    // Se já existe sprint atual, retornar ela
    return res.json(sprintAtual.Sprint);
  } catch (error) {
    console.error('Erro ao buscar sprint atual:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Atualiza a sprint atual do aluno
 */
exports.atualizarSprintAtual = async (req, res) => {
  try {
    const idusuario = req.aluno.id;
    const { sprintId } = req.body;

    if (!sprintId) {
      return res.status(400).json({ message: 'ID da sprint é obrigatório' });
    }

    // Verificar se a sprint existe
    const sprint = await Sprint.findByPk(sprintId);
    if (!sprint) {
      return res.status(404).json({ message: 'Sprint não encontrada' });
    }

    // Verificar se a sprint pertence ao plano do usuário
    const aluno = await Aluno.findByPk(idusuario, {
      include: [{
        model: Plano,
        as: 'planos',
        include: [{
          model: Sprint,
          as: 'sprints'
        }]
      }]
    });

    const sprintPertenceAoPlano = aluno.planos.some(plano => 
      plano.sprints.some(s => s.id === sprintId)
    );

    if (!sprintPertenceAoPlano) {
      return res.status(403).json({ message: 'Sprint não pertence ao plano do usuário' });
    }

    // Atualizar ou criar o registro da sprint atual
    const [sprintAtual, created] = await SprintAtual.findOrCreate({
      where: { idusuario },
      defaults: {
        SprintId: sprintId
      }
    });

    if (!created) {
      await sprintAtual.update({
        SprintId: sprintId,
        dataAtualizacao: new Date()
      });
    }

    // Buscar a sprint completa com suas metas
    const sprintCompleta = await Sprint.findByPk(sprintId, {
      include: [{
        model: Meta,
        as: 'metas'
      }]
    });

    res.json(sprintCompleta);
  } catch (error) {
    console.error('Erro ao atualizar sprint atual:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Inicializa a sprint atual do aluno com a primeira sprint do seu plano
 */
exports.inicializarSprintAtual = async (req, res) => {
  try {
    console.log('========== INICIALIZANDO SPRINT ATUAL ==========');
    const idusuario = req.user.aluno.id;
    console.log('ID do usuário:', idusuario);

    // Verificar se já existe uma sprint atual
    const sprintAtualExistente = await SprintAtual.findOne({
      where: { idusuario }
    });

    if (sprintAtualExistente) {
      console.log('Usuário já possui sprint atual');
      return res.status(400).json({ message: 'Usuário já possui sprint atual' });
    }

    // Buscar o plano do usuário
    const alunoPlano = await AlunoPlano.findOne({
      where: { IdUsuario: idusuario },
      include: [{
        model: Plano,
        as: 'plano',
        include: [{
          model: Sprint,
          as: 'sprints',
          include: [{
            model: Meta,
            as: 'metas'
          }]
        }]
      }]
    });

    if (!alunoPlano || !alunoPlano.plano || !alunoPlano.plano.sprints || alunoPlano.plano.sprints.length === 0) {
      return res.status(404).json({ message: 'Usuário não possui plano de estudo com sprints' });
    }

    // Ordenar as sprints por posição
    const sprintsOrdenadas = alunoPlano.plano.sprints.sort((a, b) => a.posicao - b.posicao);
    const primeiraSprint = sprintsOrdenadas[0];
    
    // Criar o registro da sprint atual
    const sprintAtual = await SprintAtual.create({
      idusuario,
      SprintId: primeiraSprint.id
    });

    // Buscar a sprint completa com suas metas
    const sprintCompleta = await Sprint.findByPk(primeiraSprint.id, {
      include: [{
        model: Meta,
        as: 'metas'
      }]
    });

    res.json(sprintCompleta);
  } catch (error) {
    console.error('Erro ao inicializar sprint atual:', error);
    res.status(500).json({ message: error.message });
  }
}; 