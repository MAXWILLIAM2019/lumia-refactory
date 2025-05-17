/**
 * Controller de Disciplina
 * 
 * Este módulo gerencia todas as operações relacionadas às disciplinas,
 * incluindo criação, consulta, atualização e remoção (CRUD).
 */
const Disciplina = require('../models/Disciplina');
const Assunto = require('../models/Assunto');
const { Op } = require('sequelize');
const sequelize = require('../db');

/**
 * Lista todas as disciplinas cadastradas
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de disciplinas com seus assuntos
 */
exports.listarDisciplinas = async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ],
      order: [
        ['nome', 'ASC'],
        [{ model: Assunto, as: 'assuntos' }, 'nome', 'ASC']
      ]
    });
    
    res.status(200).json(disciplinas);
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar disciplinas',
      error: error.message 
    });
  }
};

/**
 * Lista apenas as disciplinas ativas
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} res - Resposta HTTP
 * @returns {Array} Lista de disciplinas ativas com seus assuntos
 */
exports.listarDisciplinasAtivas = async (req, res) => {
  try {
    const disciplinas = await Disciplina.findAll({
      where: {
        ativa: true
      },
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ],
      order: [
        ['nome', 'ASC'],
        [{ model: Assunto, as: 'assuntos' }, 'nome', 'ASC']
      ]
    });
    
    res.status(200).json(disciplinas);
  } catch (error) {
    console.error('Erro ao listar disciplinas ativas:', error);
    res.status(500).json({ 
      message: 'Erro ao listar disciplinas ativas',
      error: error.message 
    });
  }
};

/**
 * Busca uma disciplina pelo ID
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Dados da disciplina encontrada ou erro
 */
exports.buscarDisciplina = async (req, res) => {
  try {
    const disciplina = await Disciplina.findByPk(req.params.id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ]
    });
    
    if (!disciplina) {
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    res.status(200).json(disciplina);
  } catch (error) {
    console.error('Erro ao buscar disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao buscar disciplina',
      error: error.message 
    });
  }
};

/**
 * Cria uma nova disciplina
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.body - Corpo da requisição
 * @param {string} req.body.nome - Nome da disciplina
 * @param {boolean} req.body.ativa - Indica se a disciplina está ativa (opcional, default: true)
 * @param {Array} req.body.assuntos - Lista de assuntos da disciplina (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Disciplina criada ou erro
 */
exports.criarDisciplina = async (req, res) => {
  try {
    const { nome, assuntos, ativa = true } = req.body;
    
    // Verifica se já existe uma disciplina com o mesmo nome
    // Usando LOWER para fazer comparação case-insensitive no SQLite
    const disciplinaExistente = await Disciplina.findOne({
      where: sequelize.where(
        sequelize.fn('LOWER', sequelize.col('nome')), 
        sequelize.fn('LOWER', nome)
      )
    });
    
    if (disciplinaExistente) {
      return res.status(400).json({ 
        message: 'Já existe uma disciplina com este nome' 
      });
    }
    
    // Cria a disciplina
    const disciplina = await Disciplina.create({ 
      nome,
      ativa: ativa === false ? false : true // Garante que seja um booleano
    });
    
    // Se houver assuntos, adiciona-os
    if (assuntos && Array.isArray(assuntos) && assuntos.length > 0) {
      const assuntosData = assuntos.map(assunto => ({
        nome: assunto.nome,
        disciplinaId: disciplina.id
      }));
      
      await Assunto.bulkCreate(assuntosData);
    }
    
    // Retorna a disciplina criada com seus assuntos
    const disciplinaCompleta = await Disciplina.findByPk(disciplina.id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ]
    });
    
    res.status(201).json(disciplinaCompleta);
  } catch (error) {
    console.error('Erro ao criar disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao criar disciplina',
      error: error.message 
    });
  }
};

/**
 * Atualiza uma disciplina existente
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} req.body - Corpo da requisição
 * @param {string} req.body.nome - Nome da disciplina (opcional)
 * @param {boolean} req.body.ativa - Status da disciplina (opcional)
 * @param {Array} req.body.assuntos - Lista de assuntos da disciplina (opcional)
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.atualizarDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, assuntos, ativa } = req.body;
    
    // Verifica se a disciplina existe
    const disciplina = await Disciplina.findByPk(id);
    if (!disciplina) {
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    // Prepara os dados para atualização
    const dadosAtualizacao = {};
    
    // Se o nome for alterado, verifica se já existe outra disciplina com o mesmo nome
    if (nome && nome !== disciplina.nome) {
      const disciplinaExistente = await Disciplina.findOne({
        where: sequelize.and(
          { id: { [Op.ne]: id } },
          sequelize.where(
            sequelize.fn('LOWER', sequelize.col('nome')),
            sequelize.fn('LOWER', nome)
          )
        )
      });
      
      if (disciplinaExistente) {
        return res.status(400).json({ 
          message: 'Já existe outra disciplina com este nome' 
        });
      }
      
      // Adiciona o nome aos dados de atualização
      dadosAtualizacao.nome = nome;
    }
    
    // Adiciona o status ativa/inativa aos dados de atualização se fornecido
    if (ativa !== undefined) {
      dadosAtualizacao.ativa = ativa === false ? false : true; // Garante que seja um booleano
    }
    
    // Atualiza a disciplina com todos os campos necessários
    if (Object.keys(dadosAtualizacao).length > 0) {
      await disciplina.update(dadosAtualizacao);
    }
    
    // Se houver assuntos, atualiza-os
    if (assuntos && Array.isArray(assuntos)) {
      // Remove todos os assuntos existentes
      await Assunto.destroy({ where: { disciplinaId: id } });
      
      // Adiciona os novos assuntos
      if (assuntos.length > 0) {
        const assuntosData = assuntos.map(assunto => ({
          nome: assunto.nome,
          disciplinaId: id
        }));
        
        await Assunto.bulkCreate(assuntosData);
      }
    }
    
    // Retorna a disciplina atualizada com seus assuntos
    const disciplinaAtualizada = await Disciplina.findByPk(id, {
      include: [
        {
          model: Assunto,
          as: 'assuntos'
        }
      ]
    });
    
    res.status(200).json(disciplinaAtualizada);
  } catch (error) {
    console.error('Erro ao atualizar disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao atualizar disciplina',
      error: error.message 
    });
  }
};

/**
 * Remove uma disciplina
 * 
 * @param {Object} req - Requisição HTTP
 * @param {Object} req.params - Parâmetros da requisição
 * @param {Number} req.params.id - ID da disciplina
 * @param {Object} res - Resposta HTTP
 * @returns {Object} Mensagem de sucesso ou erro
 */
exports.removerDisciplina = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verifica se a disciplina existe
    const disciplina = await Disciplina.findByPk(id);
    if (!disciplina) {
      return res.status(404).json({ message: 'Disciplina não encontrada' });
    }
    
    // Remove a disciplina (os assuntos serão removidos em cascata)
    await disciplina.destroy();
    
    res.status(200).json({ message: 'Disciplina removida com sucesso' });
  } catch (error) {
    console.error('Erro ao remover disciplina:', error);
    res.status(500).json({ 
      message: 'Erro ao remover disciplina',
      error: error.message 
    });
  }
}; 