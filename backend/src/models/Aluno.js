const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo Aluno
 * Representa um aluno do sistema
 * 
 * Campos:
 * - nome: Nome completo do aluno
 * - email: Email do aluno (único)
 * - cpf: CPF do aluno (único)
 */
const Aluno = sequelize.define('Aluno', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = Aluno; 