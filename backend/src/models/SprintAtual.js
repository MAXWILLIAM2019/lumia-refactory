const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo SprintAtual
 * Armazena a sprint atual de cada aluno
 * 
 * Campos:
 * - idusuario: ID do usuário/aluno
 * - SprintId: ID da sprint atual
 * - dataAtualizacao: Data da última atualização
 */
const SprintAtual = sequelize.define('SprintAtual', {
  idusuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuario',
      key: 'idusuario'
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
  tableName: 'SprintAtual',
  timestamps: true
});

module.exports = SprintAtual; 