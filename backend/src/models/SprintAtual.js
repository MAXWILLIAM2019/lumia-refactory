const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo SprintAtual
 * Armazena a sprint atual de cada aluno
 * 
 * Campos:
 * - AlunoId: ID do aluno
 * - SprintId: ID da sprint atual
 * - dataAtualizacao: Data da última atualização
 */
const SprintAtual = sequelize.define('SprintAtual', {
  AlunoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Alunos',
      key: 'id'
    }
  },
  SprintId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Sprints',
      key: 'id'
    }
  },
  dataAtualizacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'SprintAtuals',
  timestamps: true
});

module.exports = SprintAtual; 