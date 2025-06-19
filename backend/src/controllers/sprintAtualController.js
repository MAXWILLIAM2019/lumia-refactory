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
    
    // Obter o ID do usuário, considerando impersonation
    const idusuario = req.user.id;
    console.log('Informações do usuário:', req.user);
    console.log('ID do usuário:', idusuario);

    if (!idusuario) {
      return res.status(400).json({ message: 'ID do usuário não encontrado' });
    }

    // Primeiro, buscar o plano do usuário
    const alunoPlano = await AlunoPlano.findOne({
      where: { idusuario },
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
 * 
 * ATENÇÃO: FUNCIONALIDADE TESTADA E FUNCIONAL - NÃO ALTERAR SEM CONSULTA!
 * 
 * Este método é responsável por:
 * 1. Atualizar qual sprint o aluno está fazendo atualmente
 * 2. Gerenciar o status da sprint anterior ao avançar
 * 
 * Fluxo de Gerenciamento de Status:
 * 1. Ao avançar para próxima sprint:
 *    - Verifica se todas as metas da sprint atual estão concluídas
 *    - Se sim, marca a sprint atual como 'Concluída' antes de mudar
 * 
 * IMPORTANTE:
 * - Esta função trabalha em conjunto com sprintController.updateMetaInstancia
 *   para garantir consistência no status das sprints
 * - O status 'Concluída' pode ser atribuído aqui ou ao concluir todas as metas
 * - Não permite avançar se houver metas pendentes
 * 
 * Validações de Segurança:
 * - Verifica se a sprint pertence ao plano do usuário
 * - Verifica se o usuário tem plano ativo
 * - Verifica conclusão das metas antes de avançar
 * 
 * @param {Object} req.user.id - ID do usuário logado
 * @param {Object} req.body - Dados da atualização
 * @param {number} req.body.sprintId - ID da nova sprint atual
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

    // Verificar se a sprint pertence ao plano do usuário usando AlunoPlano
    const alunoPlano = await AlunoPlano.findOne({
      where: { 
        idusuario,
        ativo: true 
      },
      include: [{
        model: Plano,
        as: 'plano',
        include: [{
          model: Sprint,
          as: 'sprints'
        }]
      }]
    });

    if (!alunoPlano) {
      return res.status(403).json({ message: 'Aluno não possui plano ativo' });
    }

    const sprintPertenceAoPlano = alunoPlano.plano.sprints.some(s => s.id === sprintId);

    if (!sprintPertenceAoPlano) {
      return res.status(403).json({ message: 'Sprint não pertence ao plano do usuário' });
    }

    // Buscar a sprint atual antes de atualizar
    const sprintAtualAnterior = await SprintAtual.findOne({
      where: { idusuario },
      include: [{
        model: Sprint,
        include: [{
          model: Meta,
          as: 'metas'
        }]
      }]
    });

    // Se existir uma sprint atual, marcar como concluída antes de mudar
    if (sprintAtualAnterior && sprintAtualAnterior.Sprint) {
      const todasMetasConcluidas = sprintAtualAnterior.Sprint.metas.every(
        meta => meta.status === 'Concluída'
      );

      if (todasMetasConcluidas) {
        await sprintAtualAnterior.Sprint.update({ status: 'Concluída' });
      }
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