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
 * 
 * Nota: Os relacionamentos são definidos no arquivo index.js para evitar
 * problemas de referência circular e duplicação.
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
  },
  plano_mestre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'PlanosMestre',
      key: 'id'
    },
    comment: 'Referência ao plano mestre que originou este plano'
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = Plano; 