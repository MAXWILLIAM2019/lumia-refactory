const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo Sprint
 * Representa uma sprint de estudos com suas metas
 * 
 * Campos:
 * - nome: Nome da sprint (ex: "Sprint 19")
 * - dataInicio: Data de início da sprint
 * - dataFim: Data de término da sprint
 * 
 * Relacionamentos:
 * - hasMany Meta: Uma sprint pode ter várias metas
 */
const Sprint = sequelize.define('Sprint', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dataInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dataFim: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
});

module.exports = Sprint; 