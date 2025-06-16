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
    const idusuario = req.user.id;
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
            as: 'metas',
            attributes: [
              'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link', 
              'relevancia', 'tempoEstudado', 'desempenho', 'status',
              'totalQuestoes', 'questoesCorretas', 'SprintId'
            ]
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

    // Buscar a sprint atual do usuário com todas as metas instanciadas
    let sprintAtual = await SprintAtual.findOne({
      where: { idusuario },
      include: [{
        model: Sprint,
        include: [{
          model: Meta,
          as: 'metas',
          attributes: [
            'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link', 
            'relevancia', 'tempoEstudado', 'desempenho', 'status',
            'totalQuestoes', 'questoesCorretas', 'SprintId'
          ]
        }]
      }]
    });

    // Se não existir sprint atual, criar com a primeira sprint do plano
    if (!sprintAtual) {
      sprintAtual = await SprintAtual.create({
        idusuario,
        SprintId: primeiraSprint.id
      });

      // Buscar a sprint completa com suas metas instanciadas
      const sprintCompleta = await Sprint.findByPk(primeiraSprint.id, {
        include: [{
          model: Meta,
          as: 'metas',
          attributes: [
            'id', 'disciplina', 'tipo', 'titulo', 'comandos', 'link', 
            'relevancia', 'tempoEstudado', 'desempenho', 'status',
            'totalQuestoes', 'questoesCorretas', 'SprintId'
          ]
        }]
      });

      // Formatar a resposta
      const sprintFormatada = {
        id: sprintCompleta.id,
        nome: sprintCompleta.nome,
        posicao: sprintCompleta.posicao,
        dataInicio: sprintCompleta.dataInicio,
        dataFim: sprintCompleta.dataFim,
        PlanoId: sprintCompleta.PlanoId,
        metas: sprintCompleta.metas.map(meta => ({
          id: meta.id,
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
          SprintId: meta.SprintId
        }))
      };

      return res.json(sprintFormatada);
    }

    // Se já existe sprint atual, formatar e retornar
    const sprintFormatada = {
      id: sprintAtual.Sprint.id,
      nome: sprintAtual.Sprint.nome,
      posicao: sprintAtual.Sprint.posicao,
      dataInicio: sprintAtual.Sprint.dataInicio,
      dataFim: sprintAtual.Sprint.dataFim,
      PlanoId: sprintAtual.Sprint.PlanoId,
      metas: sprintAtual.Sprint.metas.map(meta => ({
        id: meta.id,
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
        SprintId: meta.SprintId
      }))
    };

    return res.json(sprintFormatada);
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
    const idusuario = req.user.id;
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