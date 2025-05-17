const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo Disciplina
 * Representa uma disciplina dentro de um plano de estudos
 * 
 * Campos:
 * - nome: Nome da disciplina
 * 
 * Relacionamentos:
 * - belongsTo Plano: Uma disciplina pertence a um plano
 * - hasMany Assunto: Uma disciplina pode ter vários assuntos
 * 
 * Nota: Os relacionamentos são definidos no arquivo index.js para evitar
 * problemas de referência circular e duplicação.
 */
const Disciplina = sequelize.define('Disciplina', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = Disciplina; 