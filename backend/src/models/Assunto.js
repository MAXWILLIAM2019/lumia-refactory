const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo Assunto
 * Representa um assunto dentro de uma disciplina
 * 
 * Campos:
 * - nome: Nome do assunto
 * 
 * Relacionamentos:
 * - belongsTo Disciplina: Um assunto pertence a uma disciplina
 * 
 * Nota: Os relacionamentos são definidos no arquivo index.js para evitar
 * problemas de referência circular e duplicação.
 */
const Assunto = sequelize.define('Assunto', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = Assunto; 