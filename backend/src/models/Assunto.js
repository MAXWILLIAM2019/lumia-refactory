const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Disciplina = require('./Disciplina');

/**
 * Modelo Assunto
 * Representa um assunto dentro de uma disciplina
 * 
 * Campos:
 * - nome: Nome do assunto
 * 
 * Relacionamentos:
 * - belongsTo Disciplina: Um assunto pertence a uma disciplina
 */
const Assunto = sequelize.define('Assunto', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

// Define o relacionamento com Disciplina
Assunto.belongsTo(Disciplina);
Disciplina.hasMany(Assunto);

module.exports = Assunto; 