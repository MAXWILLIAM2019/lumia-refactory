/**
 * Modelo Plano
 * Representa uma instância de plano de estudos gerada a partir de um PlanoMestre (template)
 * 
 * Campos:
 * - nome: Nome do plano (herdado do template)
 * - cargo: Cargo alvo do plano (herdado do template)
 * - descricao: Descrição detalhada do plano (herdado do template)
 * - duracao: Duração em meses (herdado do template)
 * - plano_mestre_id: Referência ao template que originou esta instância
 * 
 * Relacionamentos:
 * - belongsTo PlanoMestre: Uma instância pertence a um template
 * - hasMany Sprint: Uma instância pode ter várias sprints
 * - belongsToMany Disciplina: Mantém as disciplinas associadas à instância
 * 
 * Nota: Os relacionamentos são definidos no arquivo index.js para evitar
 * problemas de referência circular e duplicação.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

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
    comment: 'Referência ao plano mestre (template) que originou esta instância'
  }
}, {
  timestamps: true // Adiciona createdAt e updatedAt
});

module.exports = Plano; 