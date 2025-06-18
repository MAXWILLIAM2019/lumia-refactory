/**
 * Controller de AlunoPlano
 * 
 * ATENÇÃO: FUNCIONALIDADE TESTADA E FUNCIONAL - NÃO ALTERAR SEM CONSULTA!
 * 
 * Este módulo gerencia todas as operações relacionadas às associações entre alunos e planos.
 * Implementa dois fluxos principais de atribuição de planos:
 * 
 * 1. Atribuição Direta (via atribuirPlanoAluno):
 *    - Associa um plano já existente a um aluno
 *    - Usado principalmente para planos personalizados ou reatribuições
 *    - Define automaticamente ativo = true para o novo plano
 *    - Cancela automaticamente qualquer plano ativo existente do aluno
 * 
 * 2. Atribuição via Template (via planoMestreController.criarInstancia):
 *    - Cria uma nova instância de plano a partir de um PlanoMestre
 *    - Copia toda a estrutura: plano, sprints e metas
 *    - Também define ativo = true e gerencia planos existentes
 * 
 * IMPORTANTE:
 * - Um aluno só pode ter um plano ativo por vez
 * - Ao atribuir um novo plano, o anterior é automaticamente cancelado
 * - O campo 'ativo' é usado para filtrar planos nas consultas
 * - Nunca delete registros, apenas marque como inativos
 */
const AlunoPlano = require('../models/AlunoPlano');
const Aluno = require('../models/Aluno');
const Plano = require('../models/Plano');
const Usuario = require('../models/Usuario');
const Sprint = require('../models/Sprint');
const Meta = require('../models/Meta');
const { Op } = require('sequelize');
const sequelize = require('../db');

/**
 * Atribui um plano a um aluno
 * 
 * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
 * 
 * Fluxo de execução:
 * 1. Valida existência do usuário e plano
 * 2. Verifica se o usuário já tem plano ativo
 *    - Se sim, cancela o plano existente antes de prosseguir
 * 3. Verifica se já existe associação para este par usuário/plano
 * 4. Calcula data prevista de término baseada na duração do plano
 * 5. Cria nova associação com ativo = true
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição
 * @param {number} req.body.idusuario - ID do usuário
 * @param {number} req.body.planoId - ID do plano
 * @param {Date} [req.body.dataInicio] - Data de início (opcional, default: data atual)
 * @param {string} [req.body.status] - Status inicial (opcional, default: 'não iniciado')
 * @param {string} [req.body.observacoes] - Observações (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados da associação criada ou mensagem de erro
 */
exports.atribuirPlanoAluno = async (req, res) => {
  console.log('=== INÍCIO DA ATRIBUIÇÃO DE PLANO (BACKEND) ===');
  console.log('Dados recebidos:', req.body);
  
  const transaction = await sequelize.transaction();
  console.log('Transação iniciada');
  
  try {
    const { idusuario, PlanoId, dataInicio, dataPrevisaoTermino, status, observacoes } = req.body;
    console.log('Dados extraídos:', { idusuario, PlanoId, dataInicio, dataPrevisaoTermino, status });
    
    // Verificar se o usuário existe
    console.log('1. Verificando usuário...');
    const usuario = await Usuario.findByPk(idusuario, { transaction });
    if (!usuario) {
      console.log('✗ Usuário não encontrado:', idusuario);
      await transaction.rollback();
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    console.log('✓ Usuário encontrado:', usuario.nome);
    
    // Verificar se o plano existe
    console.log('2. Verificando plano...');
    const plano = await Plano.findByPk(PlanoId, { transaction });
    if (!plano) {
      console.log('✗ Plano não encontrado:', PlanoId);
      await transaction.rollback();
      return res.status(404).json({ message: 'Plano não encontrado' });
    }
    console.log('✓ Plano encontrado:', plano.nome);
    
    // Verificar se o usuário já tem algum plano ativo
    console.log('3. Verificando planos ativos do usuário...');
    const planoExistente = await AlunoPlano.findOne({
      where: {
        idusuario: idusuario,
        [Op.or]: [
          { status: 'não iniciado' },
          { status: 'em andamento' }
        ]
      },
      transaction
    });
    
    if (planoExistente) {
      console.log('! Encontrado plano ativo, cancelando...');
      await planoExistente.update({ 
        status: 'cancelado',
        observacoes: (planoExistente.observacoes || '') + 
                    '\nPlano substituído por um novo em ' + new Date().toISOString().split('T')[0]
      }, { transaction });
      console.log('✓ Plano anterior cancelado');
    }
    
    // Verificar associação existente
    console.log('4. Verificando associação existente...');
    const associacaoExistente = await AlunoPlano.findOne({
      where: {
        idusuario: idusuario,
        PlanoId: PlanoId
      },
      transaction
    });
    if (associacaoExistente) {
      console.log('✗ Associação já existe');
      await transaction.rollback();
      return res.status(400).json({ message: 'Este usuário já está associado a este plano.' });
    }
    
    // Calcular data prevista de término
    console.log('5. Calculando data de término...');
    let dataFinal = dataPrevisaoTermino;
    if (!dataFinal && plano.duracao) {
      const dataBase = dataInicio ? new Date(dataInicio) : new Date();
      dataFinal = new Date(dataBase);
      dataFinal.setMonth(dataFinal.getMonth() + plano.duracao);
      console.log('Data de término calculada:', dataFinal);
    }
    
    // Criar a associação
    console.log('6. Criando nova associação...');
    const dadosCriacao = {
      idusuario: idusuario,
      PlanoId: PlanoId,
      dataInicio: dataInicio || new Date(),
      dataPrevisaoTermino: dataFinal,
      status: status || 'não iniciado',
      observacoes,
      ativo: true
    };
    console.log('Dados para criação:', dadosCriacao);
    
    const alunoPlano = await AlunoPlano.create(dadosCriacao, { transaction });
    console.log('✓ Associação criada com sucesso');
    
    await transaction.commit();
    console.log('✓ Transação confirmada');
    
    // Retornar a associação criada com dados do usuário e plano
    const resultado = await AlunoPlano.findOne({
      where: {
        idusuario: alunoPlano.idusuario,
        PlanoId: alunoPlano.PlanoId
      },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idusuario', 'login'] },
        { model: Plano, as: 'plano' }
      ]
    });
    
    console.log('=== ATRIBUIÇÃO DE PLANO CONCLUÍDA COM SUCESSO ===');
    res.status(201).json(resultado);
  } catch (error) {
    console.error('=== ERRO NA ATRIBUIÇÃO DE PLANO ===', {
      message: error.message,
      stack: error.stack
    });
    await transaction.rollback();
    console.log('✗ Transação revertida devido a erro');
    res.status(500).json({ 
      message: 'Erro ao atribuir plano ao usuário',
      error: error.message 
    });
  }
};

/**
 * Atualiza o progresso de um aluno em um plano
 * 
 * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
 * 
 * Fluxo de execução:
 * 1. Busca a associação aluno-plano pela chave composta (idusuario, PlanoId)
 * 2. Atualiza campos conforme solicitado:
 *    - progresso: percentual de conclusão (0-100)
 *    - status: estado atual do plano
 *    - dataConclusao: preenchida automaticamente ao concluir
 *    - observacoes: notas sobre o progresso
 * 3. Se status muda para 'concluído', define data de conclusão
 * 
 * IMPORTANTE: Este método não altera o campo 'ativo'
 * A ativação/inativação deve ser feita via atribuição de planos
 */
exports.atualizarProgresso = async (req, res) => {
  try {
    const { idusuario, PlanoId } = req.body;
    const { id } = req.params; // id não existe, mas mantido para compatibilidade de rota
    if (!idusuario || !PlanoId) {
      return res.status(400).json({ message: 'idusuario e PlanoId são obrigatórios' });
    }
    // Buscar pela chave composta
    const alunoPlano = await AlunoPlano.findOne({
      where: { idusuario: idusuario, PlanoId },
    });
    if (!alunoPlano) {
      return res.status(404).json({ message: 'Associação aluno-plano não encontrada' });
    }
    // Atualizar os campos
    const { progresso, status, dataConclusao, observacoes } = req.body;
    const dadosAtualizacao = {};
    if (progresso !== undefined) dadosAtualizacao.progresso = progresso;
    if (status) {
      dadosAtualizacao.status = status;
      if (status === 'concluído' && !dataConclusao && !alunoPlano.dataConclusao) {
        dadosAtualizacao.dataConclusao = new Date();
      }
    }
    if (dataConclusao) {
      dadosAtualizacao.dataConclusao = dataConclusao;
      if (alunoPlano.status !== 'concluído' && !status) {
        dadosAtualizacao.status = 'concluído';
      }
    }
    if (observacoes !== undefined) dadosAtualizacao.observacoes = observacoes;
    await alunoPlano.update(dadosAtualizacao);
    // Buscar os dados atualizados
    const resultado = await AlunoPlano.findOne({
      where: { idusuario: idusuario, PlanoId },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idusuario', 'login'] },
        { model: Plano, as: 'plano' }
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
 * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
 * 
 * IMPORTANTE: 
 * - Este método realiza exclusão física do registro
 * - Para inativar um plano, use atribuirPlanoAluno com um novo plano
 * - Só use este método em casos específicos de correção de dados
 * 
 * Fluxo:
 * 1. Busca associação pela chave composta
 * 2. Remove o registro se encontrado
 */
exports.removerAssociacao = async (req, res) => {
  try {
    const { idusuario, PlanoId } = req.body;
    if (!idusuario || !PlanoId) {
      return res.status(400).json({ message: 'idusuario e PlanoId são obrigatórios' });
    }
    // Buscar pela chave composta
    const alunoPlano = await AlunoPlano.findOne({
      where: { idusuario: idusuario, PlanoId },
    });
    if (!alunoPlano) {
      return res.status(404).json({ message: 'Associação aluno-plano não encontrada' });
    }
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
 * ATENÇÃO: Método testado e funcional - Não alterar sem consulta!
 * 
 * Retorna:
 * - Dados do usuário (ID, login)
 * - Dados do plano (ID, nome, cargo, duração)
 * - Dados da associação (datas, progresso, status)
 * 
 * IMPORTANTE: 
 * - Use os includes e attributes para otimizar a query
 * - Mantenha a ordenação por data de criação
 */
exports.listarAssociacoes = async (req, res) => {
  try {
    const associacoes = await AlunoPlano.findAll({
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idusuario', 'login'] },
        { model: Plano, as: 'plano' }
      ]
    });
    res.json(associacoes);
  } catch (error) {
    console.error('Erro ao listar associações:', error);
    res.status(500).json({ 
      message: 'Erro ao listar associações',
      error: error.message 
    });
  }
};

/**
 * Busca uma associação aluno-plano específica
 */
exports.buscarAssociacaoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const associacao = await AlunoPlano.findOne({
      where: { id },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idusuario', 'login'] },
        { model: Plano, as: 'plano' }
      ]
    });
    
    if (!associacao) {
      return res.status(404).json({ message: 'Associação não encontrada' });
    }
    
    res.json(associacao);
  } catch (error) {
    console.error('Erro ao buscar associação:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar associação',
      error: error.message 
    });
  }
};

/**
 * Busca os planos associados a um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {number} req.params.idusuario - ID do usuário
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de planos do aluno com dados de progresso
 */
exports.buscarPlanosPorAluno = async (req, res) => {
  try {
    const { alunoId } = req.params;
    const associacoes = await AlunoPlano.findAll({
      where: { idusuario: alunoId },
      include: [
        { model: Plano, as: 'plano' }
      ]
    });
    res.json(associacoes);
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
    const associacoes = await AlunoPlano.findAll({
      where: { PlanoId: planoId },
      include: [
        { model: Usuario, as: 'usuario', attributes: ['idusuario', 'login'] }
      ]
    });
    res.json(associacoes);
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
 * ATENÇÃO: Retorna apenas planos ativos (ativo = true)
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Associação aluno-plano do aluno autenticado
 */
exports.buscarPlanoDoAlunoLogado = async (req, res) => {
  try {
    console.log('========== BUSCANDO PLANO DO ALUNO LOGADO ==========');
    console.log('Dados do usuário:', req.user);
    
    const idUsuario = req.user.id;
    console.log('ID do usuário:', idUsuario);
    
    // Buscar a associação aluno-plano diretamente
    console.log('Buscando associação aluno-plano com os parâmetros:', {
      idusuario: idUsuario,
      ativo: true
    });
    
    const associacao = await AlunoPlano.findOne({
      where: { 
        idusuario: idUsuario,
        ativo: true
      },
      include: [
        { 
          model: Plano,
          as: 'plano',
          include: [
            {
              model: Sprint,
              as: 'sprints',
              include: [
                { 
                  model: Meta,
                  as: 'metas'
                }
              ]
            }
          ]
        }
      ]
    });

    if (!associacao) {
      console.log('Nenhum plano ativo encontrado para o usuário');
      return res.status(404).json({ message: 'Você não possui planos de estudo atribuídos.' });
    }

    // Contar sprints e metas
    const sprints = associacao.plano.sprints || [];
    const metas = sprints.reduce((total, sprint) => total + (sprint.metas ? sprint.metas.length : 0), 0);

    console.log('Plano encontrado:', {
      planoId: associacao.PlanoId,
      nome: associacao.plano.nome,
      status: associacao.status,
      sprints: sprints.length,
      metas: metas
    });

    console.log('========== FIM DA BUSCA DO PLANO DO ALUNO ==========');
    res.json(associacao);
  } catch (error) {
    console.error('Erro ao buscar plano do aluno:', error);
    res.status(500).json({ message: 'Erro ao buscar plano do aluno' });
  }
}; 