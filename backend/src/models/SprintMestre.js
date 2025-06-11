const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo SprintMestre
 * Representa uma sprint mestre (template) que pode ser usada para gerar sprints de alunos
 * 
 * Campos:
 * - nome: Nome da sprint mestre
 * - posicao: Posição da sprint na sequência do plano mestre
 * - duracao_dias: Duração da sprint em dias
 * - descricao: Descrição da sprint
 * - PlanoMestreId: ID do plano mestre ao qual pertence
 * 
 * Relacionamentos:
 * - belongsTo PlanoMestre: Uma sprint mestre pertence a um plano mestre
 * - hasMany MetaMestre: Uma sprint mestre pode ter várias metas mestre
 * - hasMany Sprint: Uma sprint mestre pode gerar várias instâncias de sprints
 */
const SprintMestre = sequelize.define('SprintMestre', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  duracao_dias: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 7
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  PlanoMestreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'PlanoMestreId'
  }
}, {
  tableName: 'SprintsMestre',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['PlanoMestreId', 'posicao'],
      name: 'plano_mestre_posicao_unique'
    }
  ]
});

module.exports = SprintMestre; 