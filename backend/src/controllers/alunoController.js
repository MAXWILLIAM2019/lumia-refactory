/**
 * Controller de Aluno
 * 
 * Este módulo gerencia todas as operações relacionadas a alunos,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 * Implementa regras de negócio e validação de dados.
 */
const Aluno = require('../models/Aluno');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Cria um novo aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} req.body.nome - Nome do aluno
 * @param {string} req.body.email - Email do aluno (deve ser único)
 * @param {string} req.body.cpf - CPF do aluno (deve ser único)
 * @param {string} [req.body.senha] - Senha do aluno (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Aluno criado com status 201 ou mensagem de erro
 */
exports.createAluno = async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    
    // Cria uma cópia dos dados para não modificar o req.body diretamente
    const dadosAluno = { ...req.body };
    
    // Se uma senha foi fornecida, criptografa antes de salvar
    if (dadosAluno.senha) {
      dadosAluno.senha = await bcrypt.hash(dadosAluno.senha, 10);
    }
    
    const aluno = await Aluno.create(dadosAluno);
    
    // Remove a senha do objeto de resposta por segurança
    const alunoResponse = aluno.toJSON();
    delete alunoResponse.senha;
    
    console.log('Aluno criado:', alunoResponse);
    res.status(201).json(alunoResponse);
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    // Tratamento específico para violação de chave única (email ou CPF duplicado)
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        message: 'Já existe um aluno cadastrado com este email ou CPF' 
      });
    }
    res.status(500).json({ 
      message: 'Erro ao cadastrar aluno',
      error: error.message 
    });
  }
};

/**
 * Busca todos os alunos
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de todos os alunos cadastrados
 */
exports.getAllAlunos = async (req, res) => {
  try {
    console.log('Buscando todos os alunos...');
    
    // Verificando se a tabela existe
    try {
      await Aluno.findAll({ limit: 1 });
    } catch (tableError) {
      console.error('Erro ao acessar tabela de alunos:', tableError);
      return res.status(500).json({ 
        message: 'Erro ao acessar tabela de alunos. Verifique se a tabela foi criada corretamente.',
        error: tableError.message 
      });
    }
    
    const alunos = await Aluno.findAll({
      attributes: { exclude: ['senha'] } // Exclui o campo senha da lista
    });
    console.log(`${alunos.length} alunos encontrados`);
    
    // Se a lista estiver vazia, retorna um array vazio em vez de erro
    if (!alunos || alunos.length === 0) {
      console.log('Nenhum aluno encontrado, retornando array vazio');
      return res.json([]);
    }
    
    res.json(alunos);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ 
      message: 'Erro ao listar alunos',
      error: error.message 
    });
  }
};

/**
 * Busca um aluno específico
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados do aluno encontrado ou mensagem de erro 404
 */
exports.getAlunoById = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id, {
      attributes: { exclude: ['senha'] } // Exclui o campo senha da resposta
    });
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    res.json(aluno);
  } catch (error) {
    console.error('Erro ao buscar aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar aluno',
      error: error.message 
    });
  }
};

/**
 * Atualiza um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} req.body - Dados atualizados do aluno
 * @param {string} [req.body.nome] - Novo nome do aluno
 * @param {string} [req.body.email] - Novo email do aluno
 * @param {string} [req.body.cpf] - Novo CPF do aluno
 * @param {string} [req.body.senha] - Nova senha do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados do aluno atualizado ou mensagem de erro
 */
exports.updateAluno = async (req, res) => {
  try {
    // Cria uma cópia dos dados para não modificar o req.body diretamente
    const { nome, email, cpf, senha } = req.body;
    
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Prepara o objeto de atualização
    const dadosAtualizados = {
      nome,
      email,
      cpf
    };
    
    // Se uma nova senha foi fornecida, criptografa antes de salvar
    if (senha) {
      dadosAtualizados.senha = await bcrypt.hash(senha, 10);
    }

    // Atualiza os dados
    await aluno.update(dadosAtualizados);

    // Remove a senha do objeto de resposta por segurança
    const alunoResponse = aluno.toJSON();
    delete alunoResponse.senha;

    res.json(alunoResponse);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    // Aqui poderíamos adicionar tratamento específico para campos duplicados
    res.status(400).json({ message: error.message });
  }
};

/**
 * Deleta um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.deleteAluno = async (req, res) => {
  try {
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Remove o aluno
    await aluno.destroy();
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Define uma senha para um aluno existente
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} req.body - Dados da requisição
 * @param {string} req.body.senha - Nova senha do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.definirSenha = async (req, res) => {
  try {
    const { id } = req.params;
    const { senha } = req.body;
    
    // Valida a entrada
    if (!senha) {
      return res.status(400).json({ message: 'A senha é obrigatória' });
    }
    
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    
    // Criptografa e salva a senha
    const senhaCriptografada = await bcrypt.hash(senha, 10);
    await aluno.update({ senha: senhaCriptografada });
    
    res.json({ message: 'Senha definida com sucesso' });
  } catch (error) {
    console.error('Erro ao definir senha:', error);
    res.status(500).json({ message: 'Erro ao definir senha', error: error.message });
  }
};

/**
 * Gera uma senha aleatória para um aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Senha gerada em texto plano e mensagem de sucesso
 */
exports.gerarSenha = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }
    
    // Gera uma senha aleatória de 8 caracteres
    const senhaGerada = Math.random().toString(36).slice(-8);
    
    // Criptografa e salva a senha
    const senhaCriptografada = await bcrypt.hash(senhaGerada, 10);
    await aluno.update({ senha: senhaCriptografada });
    
    // Retorna a senha gerada (em texto plano) para exibição única
    res.json({ 
      message: 'Senha gerada com sucesso',
      senha: senhaGerada
    });
  } catch (error) {
    console.error('Erro ao gerar senha:', error);
    res.status(500).json({ message: 'Erro ao gerar senha', error: error.message });
  }
};

/**
 * Busca os planos associados ao aluno autenticado
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de planos associados ao aluno
 */
exports.getAlunoPlanos = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.aluno e req.user
    const alunoId = req.user.id;
    
    // Importa os modelos necessários
    const AlunoPlano = require('../models/AlunoPlano');
    const Plano = require('../models/Plano');
    
    console.log(`Buscando planos para o aluno ID ${alunoId}`);
    
    // Busca as associações aluno-plano
    const associacoes = await AlunoPlano.findAll({
      where: { alunoId },
      include: [{
        model: Plano,
        as: 'plano'
      }]
    });
    
    if (!associacoes || associacoes.length === 0) {
      console.log(`Nenhum plano encontrado para o aluno ID ${alunoId}`);
      return res.json([]);
    }
    
    // Formata o resultado
    const planos = associacoes.map(associacao => ({
      id: associacao.id,
      alunoId: associacao.alunoId,
      planoId: associacao.planoId,
      dataInicio: associacao.dataInicio,
      dataPrevisaoTermino: associacao.dataPrevisaoTermino,
      dataConclusao: associacao.dataConclusao,
      status: associacao.status,
      progresso: associacao.progresso,
      observacoes: associacao.observacoes,
      plano: associacao.plano
    }));
    
    console.log(`${planos.length} planos encontrados para o aluno ID ${alunoId}`);
    res.json(planos);
  } catch (error) {
    console.error('Erro ao buscar planos do aluno:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar planos do aluno',
      error: error.message 
    });
  }
};

/**
 * Busca as sprints associadas ao aluno logado através de seu plano
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de sprints associadas ao aluno
 */
exports.getAlunoSprints = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou req.user com id e role
    const alunoId = req.user.id;
    
    console.log(`Buscando sprints para o aluno ID ${alunoId}`);
    
    // Importa os modelos necessários
    const { AlunoPlano, Plano, Sprint, Meta } = require('../models');
    
    // Busca as associações aluno-plano
    const associacoes = await AlunoPlano.findAll({
      where: { alunoId },
      include: [{
        model: Plano
      }]
    });
    
    if (!associacoes || associacoes.length === 0) {
      console.log(`Nenhum plano encontrado para o aluno ID ${alunoId}`);
      return res.status(404).json({ 
        message: 'Aluno não possui planos de estudo atribuídos' 
      });
    }
    
    // Pega o primeiro plano (geralmente será apenas um)
    const planoId = associacoes[0].planoId;
    console.log(`Usando plano ID ${planoId} para buscar sprints`);
    
    // Busca as sprints associadas ao plano
    const sprints = await Sprint.findAll({
      where: { PlanoId: planoId },
      include: [{
        model: Meta,
        as: 'metas'
      }],
      order: [
        ['posicao', 'ASC'],
        ['dataInicio', 'ASC']
      ]
    });
    
    if (!sprints || sprints.length === 0) {
      console.log(`Nenhuma sprint encontrada para o plano ID ${planoId}`);
      return res.status(404).json({ 
        message: 'Não há sprints cadastradas no plano de estudo' 
      });
    }
    
    console.log(`${sprints.length} sprints encontradas para o aluno ID ${alunoId}`);
    res.json(sprints);
  } catch (error) {
    console.error('Erro ao buscar sprints do aluno:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Erro ao buscar sprints do aluno',
      error: error.message 
    });
  }
};

module.exports = {
  createAluno: exports.createAluno,
  getAllAlunos: exports.getAllAlunos,
  getAlunoById: exports.getAlunoById,
  updateAluno: exports.updateAluno,
  deleteAluno: exports.deleteAluno,
  definirSenha: exports.definirSenha,
  gerarSenha: exports.gerarSenha,
  getAlunoPlanos: exports.getAlunoPlanos,
  getAlunoSprints: exports.getAlunoSprints
}; 