const Aluno = require('../models/Aluno');
const { Op } = require('sequelize');

/**
 * Controller de Aluno
 * Gerencia todas as operações relacionadas a alunos
 */

/**
 * Cria um novo aluno
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição contendo dados do aluno
 * @param {string} req.body.nome - Nome do aluno
 * @param {string} req.body.email - Email do aluno
 * @param {string} req.body.cpf - CPF do aluno
 * @param {Object} res - Resposta HTTP
 */
exports.createAluno = async (req, res) => {
  try {
    console.log('Dados recebidos:', req.body);
    const aluno = await Aluno.create(req.body);
    console.log('Aluno criado:', aluno);
    res.status(201).json(aluno);
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
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
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 */
exports.getAllAlunos = async (req, res) => {
  try {
    const alunos = await Aluno.findAll();
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
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
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
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} req.body - Dados atualizados do aluno
 * @param {Object} res - Resposta HTTP
 */
exports.updateAluno = async (req, res) => {
  try {
    const { nome, email, cpf } = req.body;
    
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    await aluno.update({
      nome,
      email,
      cpf
    });

    res.json(aluno);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    res.status(400).json({ message: error.message });
  }
};

/**
 * Deleta um aluno
 * @param {Object} req - Requisição HTTP
 * @param {string} req.params.id - ID do aluno
 * @param {Object} res - Resposta HTTP
 */
exports.deleteAluno = async (req, res) => {
  try {
    const aluno = await Aluno.findByPk(req.params.id);
    if (!aluno) {
      return res.status(404).json({ message: 'Aluno não encontrado' });
    }

    await aluno.destroy();
    res.json({ message: 'Aluno deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    res.status(500).json({ message: error.message });
  }
}; 