/**
 * Modelo Assunto
 * 
 * Representa um assunto dentro de uma disciplina.
 * Este modelo define a estrutura da tabela Assunto no banco de dados,
 * incluindo validações e regras de negócio para cada campo.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Definição do modelo Assunto com os seguintes campos:
 * 
 * @property {number} id - Identificador único do assunto (gerado automaticamente)
 * @property {string} nome - Nome do assunto (obrigatório)
 * @property {number} disciplinaId - ID da disciplina a que pertence (foreign key)
 * @property {Date} createdAt - Data de criação do registro (automático)
 * @property {Date} updatedAt - Data da última atualização (automático)
 */
const Assunto = sequelize.define('Assunto', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome do assunto'
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
  comment: 'Armazena os assuntos de cada disciplina'
});

module.exports = Assunto; 