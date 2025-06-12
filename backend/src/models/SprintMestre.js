const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo SprintMestre
 * Representa uma sprint mestre (template) que pode ser usada para gerar sprints de alunos
 * 
 * Campos:
 * - nome: Nome da sprint mestre
 * - dataInicio: Data de início (opcional para templates, usado para compatibilidade)
 * - dataFim: Data de fim (opcional para templates, usado para compatibilidade)
 * - status: Status da sprint (opcional para templates, usado para compatibilidade)
 * - posicao: Posição da sprint na sequência do plano mestre

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
  dataInicio: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de início (opcional para templates, usado para compatibilidade com frontend)'
  },
  dataFim: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: 'Data de fim (opcional para templates, usado para compatibilidade com frontend)'
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    allowNull: false,
    defaultValue: 'Pendente',
    comment: 'Status da sprint (para compatibilidade com frontend, templates sempre Pendente)'
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },

  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição da sprint (específico para templates)'
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