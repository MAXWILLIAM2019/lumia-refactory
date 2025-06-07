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
 * - PlanoId: ID do plano associado a esta sprint
 * - status: Status atual da sprint (Pendente, Em Andamento, Concluída)
 * - posicao: Posição da sprint na sequência do plano (para ordenação)
 * 
 * Restrições:
 * - Não pode existir duas sprints com a mesma posição no mesmo plano (restrição de unicidade composta)
 * - Cada sprint deve estar associada a um plano (chave estrangeira)
 * 
 * Relacionamentos:
 * - hasMany Meta: Uma sprint pode ter várias metas
 * - belongsTo Plano: Uma sprint pertence a um plano
 * 
 * Nota: Atualmente, cada sprint está associada a um único plano.
 * Futuramente, pode ser necessário implementar uma relação muitos-para-muitos,
 * onde uma sprint poderá estar associada a múltiplos planos.
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
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    defaultValue: 'Pendente',
    allowNull: false
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['PlanoId', 'posicao'],
      name: 'plano_posicao_unique'
    }
  ]
});

module.exports = Sprint; 