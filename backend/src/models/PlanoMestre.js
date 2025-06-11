const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo PlanoMestre
 * Representa um plano mestre (template) que pode ser usado por múltiplos alunos
 * 
 * Campos:
 * - nome: Nome do plano mestre
 * - cargo: Cargo alvo do plano
 * - descricao: Descrição detalhada do plano
 * - duracao: Duração em meses
 * - versao: Versão do plano mestre
 * - ativo: Se o plano mestre está ativo para uso
 * 
 * Relacionamentos:
 * - hasMany SprintMestre: Um plano mestre pode ter várias sprints mestre
 * - hasMany Plano: Um plano mestre pode gerar várias instâncias de planos
 */
const PlanoMestre = sequelize.define('PlanoMestre', {
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
    validate: { min: 1 }
  },
  versao: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '1.0'
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'PlanosMestre',
  timestamps: true
});

module.exports = PlanoMestre; 