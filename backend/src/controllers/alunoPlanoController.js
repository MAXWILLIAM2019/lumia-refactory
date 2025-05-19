/**
 * Controller de AlunoPlano
 * 
 * Este módulo gerencia todas as operações relacionadas às associações entre alunos e planos,
 * incluindo atribuição de planos a alunos, atualização de progresso e consultas.
 * 
 * NOTA: Implementa relacionamento 1:1 (um aluno tem um plano) com possibilidade
 * de expansão futura para relacionamento N:N.
 */
const AlunoPlano = require('../models/AlunoPlano');
const Aluno = require('../models/Aluno');
const Plano = require('../models/Plano');
const { Op } = require('sequelize');
const sequelize = require('../db');

/**
 * Atribui um plano a um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição
 * @param {number} req.body.alunoId - ID do aluno
 * @param {number} req.body.planoId - ID do plano
 * @param {Date} [req.body.dataInicio] - Data de início (opcional, default: data atual)
 * @param {string} [req.body.status] - Status inicial (opcional, default: 'não iniciado')
 * @param {string} [req.body.observacoes] - Observações (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados da associação criada ou mensagem de erro
 */
exports.atribuirPlanoAluno = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { alunoId, planoId, dataInicio, dataPrevisaoTermino, status, observacoes } = req.body;
    
    // Verificar se o aluno existe
    const aluno = await Aluno.findByPk(alunoId, { transaction });
    if (!aluno) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    
    // Verificar se o plano existe
    const plano = await Plano.findByPk(planoId, { transaction });
    if (!plano) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Verificar se o aluno já tem algum plano ativo (para relação 1:1)
    const planoExistente = await AlunoPlano.findOne({
      where: {
        AlunoId: alunoId,
        [Op.or]: [
          { status: 'não iniciado' },
          { status: 'em andamento' }
        ]
      },
      transaction
    });
    
    if (planoExistente) {
      // Para relação 1:1, inativar o plano existente antes de criar o novo
      await planoExistente.update({ 
        status: 'cancelado',
        observacoes: (planoExistente.observacoes || '') + 
                    '\nPlano substituído por um novo em ' + new Date().toISOString().split('T')[0]
      }, { transaction });
      
      console.log(`Aluno ${alunoId} já tinha um plano ativo que foi cancelado.`);
    }
    
    // Calcular a data prevista de término se não for fornecida
    let dataFinal = dataPrevisaoTermino;
    if (!dataFinal && plano.duracao) {
      const dataBase = dataInicio ? new Date(dataInicio) : new Date();
      dataFinal = new Date(dataBase);
      dataFinal.setMonth(dataFinal.getMonth() + plano.duracao);
    }
    
    // Criar a associação
    const alunoPlano = await AlunoPlano.create({
      AlunoId: alunoId,
      PlanoId: planoId,
      dataInicio: dataInicio || new Date(),
      dataPrevisaoTermino: dataFinal,
      status: status || 'não iniciado',
      observacoes
    }, { transaction });
    
    await transaction.commit();
    
    // Retornar a associação criada com dados do aluno e plano
    const resultado = await AlunoPlano.findByPk(alunoPlano.id, {
      include: [
        { model: Aluno, as: 'Aluno' },
        { model: Plano, as: 'Plano' }
      ]
    });
    
    res.status(201).json(resultado);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atribuir plano ao aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao atribuir plano ao aluno',
      error: error.message 
    });
  }
};

/**
 * Atualiza o progresso de um aluno em um plano
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.id - ID da associação AlunoPlano
 * @param {Object} req.body - Corpo da requisição
 * @param {number} [req.body.progresso] - Percentual de progresso (0-100)
 * @param {string} [req.body.status] - Novo status
 * @param {Date} [req.body.dataConclusao] - Data de conclusão (se concluído)
 * @param {string} [req.body.observacoes] - Observações atualizadas
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados atualizados ou mensagem de erro
 */
exports.atualizarProgresso = async (req, res) => {
  try {
    const { id } = req.params;
    const { progresso, status, dataConclusao, observacoes } = req.body;
    
    // Verificar se a associação existe
    const alunoPlano = await AlunoPlano.findByPk(id);
    if (!alunoPlano) {
      return res.status(404).json({ message: 'Associação aluno-plano não encontrada' });
    }
    
    // Preparar os dados da atualização
    const dadosAtualizacao = {};
    
    if (progresso !== undefined) {
      dadosAtualizacao.progresso = progresso;
    }
    
    if (status) {
      dadosAtualizacao.status = status;
      
      // Se o status mudou para concluído e não foi fornecida uma data de conclusão, use a data atual
      if (status === 'concluído' && !dataConclusao && !alunoPlano.dataConclusao) {
        dadosAtualizacao.dataConclusao = new Date();
      }
    }
    
    if (dataConclusao) {
      dadosAtualizacao.dataConclusao = dataConclusao;
      
      // Se foi fornecida uma data de conclusão mas o status não é concluído, atualize também o status
      if (alunoPlano.status !== 'concluído' && !status) {
        dadosAtualizacao.status = 'concluído';
      }
    }
    
    if (observacoes !== undefined) {
      dadosAtualizacao.observacoes = observacoes;
    }
    
    // Atualizar a associação
    await alunoPlano.update(dadosAtualizacao);
    
    // Buscar os dados atualizados com informações do aluno e plano
    const resultado = await AlunoPlano.findByPk(id, {
      include: [
        { model: Aluno, as: 'Aluno' },
        { model: Plano, as: 'Plano' }
      ]
    });
    
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar progresso',
      error: error.message 
    });
  }
};

/**
 * Remove a associação entre um aluno e um plano
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.id - ID da associação AlunoPlano
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.removerAssociacao = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se a associação existe
    const alunoPlano = await AlunoPlano.findByPk(id);
    if (!alunoPlano) {
      return res.status(404).json({ message: 'Associação aluno-plano não encontrada' });
    }
    
    // Remover a associação
    await alunoPlano.destroy();
    
    res.status(200).json({ message: 'Associação aluno-plano removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover associação aluno-plano:', error);
    res.status(500).json({ 
      message: 'Erro ao remover associação aluno-plano',
      error: error.message 
    });
  }
};

/**
 * Lista todas as associações entre alunos e planos
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de associações com dados dos alunos e planos
 */
exports.listarAssociacoes = async (req, res) => {
  try {
    console.log('Buscando associações aluno-plano...');
    const associacoes = await AlunoPlano.findAll({
      include: [
        { 
          model: Aluno,
          as: 'Aluno',
          attributes: ['id', 'nome', 'email', 'cpf']
        },
        { 
          model: Plano,
          as: 'Plano',
          attributes: ['id', 'nome', 'cargo', 'duracao']
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Formatar a resposta para ser mais fácil de usar no frontend
    const associacoesFormatadas = associacoes.map(assoc => ({
      id: assoc.id,
      alunoId: assoc.AlunoId,
      planoId: assoc.PlanoId,
      dataInicio: assoc.dataInicio,
      dataPrevisaoTermino: assoc.dataPrevisaoTermino,
      dataConclusao: assoc.dataConclusao,
      progresso: assoc.progresso,
      status: assoc.status,
      observacoes: assoc.observacoes,
      aluno: assoc.Aluno,
      plano: assoc.Plano
    }));
    
    console.log(`${associacoesFormatadas.length} associações encontradas.`);
    res.status(200).json(associacoesFormatadas);
  } catch (error) {
    console.error('Erro ao listar associações aluno-plano:', error);
    res.status(500).json({ 
      message: 'Erro ao listar associações aluno-plano',
      error: error.message 
    });
  }
};

/**
 * Busca os planos associados a um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.alunoId - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de planos do aluno com dados de progresso
 */
exports.buscarPlanosPorAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    console.log(`Buscando planos para o aluno ID: ${alunoId}`);
    
    // Verificar se o aluno existe
    const aluno = await Aluno.findByPk(alunoId);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    
    // Buscar as associações do aluno
    const associacoes = await AlunoPlano.findAll({
      where: { AlunoId: alunoId },
      include: [{ 
        model: Plano, 
        as: 'Plano',
        attributes: ['id', 'nome', 'cargo', 'duracao', 'descricao']
      }],
      order: [['createdAt', 'DESC']]
    });
    
    // Formatar a resposta
    const planosFormatados = associacoes.map(assoc => ({
      id: assoc.id,
      alunoId: assoc.AlunoId,
      planoId: assoc.PlanoId,
      dataInicio: assoc.dataInicio,
      dataPrevisaoTermino: assoc.dataPrevisaoTermino,
      dataConclusao: assoc.dataConclusao,
      progresso: assoc.progresso,
      status: assoc.status,
      observacoes: assoc.observacoes,
      plano: assoc.Plano
    }));
    
    console.log(`Encontradas ${planosFormatados.length} associações para o aluno ${alunoId}`);
    res.status(200).json(planosFormatados);
  } catch (error) {
    console.error('Erro ao buscar planos do aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar planos do aluno',
      error: error.message 
    });
  }
};

/**
 * Busca os alunos associados a um plano
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.planoId - ID do plano
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de alunos do plano com dados de progresso
 */
exports.buscarAlunosPorPlano = async (req, res) => {
  try {
    const { planoId } = req.params;
    console.log(`Buscando alunos para o plano ID: ${planoId}`);
    
    // Verificar se o plano existe
    const plano = await Plano.findByPk(planoId);
    if (!plano) {
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    
    // Buscar as associações do plano - Use PlanoId em vez de planoId
    const associacoes = await AlunoPlano.findAll({
      where: { PlanoId: planoId },
      include: [{ model: Aluno, as: 'Aluno' }],
      order: [['progresso', 'DESC']]
    });
    
    console.log(`Encontrados ${associacoes.length} alunos para o plano ${planoId}`);
    res.status(200).json(associacoes);
  } catch (error) {
    console.error('Erro ao buscar alunos do plano:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar alunos do plano',
      error: error.message 
    });
  }
};

/**
 * Retorna o plano associado ao aluno logado
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Associação aluno-plano do aluno autenticado
 */
exports.getPlanoDoAlunoLogado = async (req, res) => {
  try {
    const alunoId = req.user.id;
    const associacao = await AlunoPlano.findOne({
      where: { AlunoId: alunoId },
      include: [
        { model: Aluno, as: 'Aluno', attributes: ['id', 'nome', 'email', 'cpf'] },
        { model: Plano, as: 'Plano', attributes: ['id', 'nome', 'cargo', 'duracao', 'descricao'] }
      ]
    });
    if (!associacao) {
      return res.status(404).json({ message: 'Nenhum plano associado a este aluno.' });
    }
    res.status(200).json({
      id: associacao.id,
      alunoId: associacao.AlunoId,
      planoId: associacao.PlanoId,
      dataInicio: associacao.dataInicio,
      dataPrevisaoTermino: associacao.dataPrevisaoTermino,
      dataConclusao: associacao.dataConclusao,
      progresso: associacao.progresso,
      status: associacao.status,
      observacoes: associacao.observacoes,
      aluno: associacao.Aluno,
      plano: associacao.Plano
    });
  } catch (error) {
    console.error('Erro ao buscar plano do aluno logado:', error);
    res.status(500).json({ message: 'Erro ao buscar plano do aluno logado', error: error.message });
  }
}; 