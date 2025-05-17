/**
 * Modelo Disciplina
 * 
 * Representa uma disciplina do sistema com seus assuntos.
 * Este modelo define a estrutura da tabela Disciplina no banco de dados,
 * incluindo validações e regras de negócio para cada campo.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Definição do modelo Disciplina com os seguintes campos:
 * 
 * @property {number} id - Identificador único da disciplina (gerado automaticamente)
 * @property {string} nome - Nome da disciplina (obrigatório)
 * @property {boolean} ativa - Indica se a disciplina está ativa (default: true)
 * @property {Date} createdAt - Data de criação do registro (automático)
 * @property {Date} updatedAt - Data da última atualização (automático)
 */
const Disciplina = sequelize.define('Disciplina', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome da disciplina'
  },
  ativa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se a disciplina está ativa'
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
  comment: 'Armazena as disciplinas disponíveis no sistema'
});

module.exports = Disciplina; 