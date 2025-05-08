const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo Plano
 * Representa um plano de estudos com suas disciplinas e assuntos
 * 
 * Campos:
 * - nome: Nome do plano
 * - cargo: Cargo alvo do plano
 * - descricao: Descrição detalhada do plano
 * - duracao: Duração em meses
 * 
 * Relacionamentos:
 * - hasMany Disciplina: Um plano pode ter várias disciplinas
 */
const Plano = sequelize.define('Plano', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  duracao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1
    }
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = Plano; 