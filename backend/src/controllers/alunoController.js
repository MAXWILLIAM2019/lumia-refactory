/**
 * Controller de Aluno
 * 
 * Este módulo gerencia todas as operações relacionadas a alunos,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 * Implementa regras de negócio e validação de dados.
 */
const Aluno = require('../models/Aluno');
const { Op } = require('sequelize');

/**
 * Cria um novo aluno
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} req.body.nome - Nome do aluno
 * @param {string} req.body.email - Email do aluno (deve ser único)
 * @param {string} req.body.cpf - CPF do aluno (deve ser único)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Aluno criado com status 201 ou mensagem de erro
 */
exports.createAluno = async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    const aluno = await Aluno.create(req.body);
    console.log('Aluno criado:', aluno);
    res.status(201).json(aluno);
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
    
    const alunos = await Aluno.findAll();
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
    const aluno = await Aluno.findByPk(req.params.id);
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
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados do aluno atualizado ou mensagem de erro
 */
exports.updateAluno = async (req, res) => {
  try {
    const { nome, email, cpf } = req.body;
    
    // Verifica se o aluno existe
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    // Atualiza os dados
    await aluno.update({
      nome,
      email,
      cpf
    });

    res.json(aluno);
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