const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Plano = require('./Plano');

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
 */
const Disciplina = sequelize.define('Disciplina', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

// Define o relacionamento com Plano
Disciplina.belongsTo(Plano);
Plano.hasMany(Disciplina);

module.exports = Disciplina; 