/**
 * Modelo Disciplina
 * 
 * Representa uma disciplina do sistema com seus assuntos.
 * Este modelo define a estrutura da tabela Disciplina no banco de dados,
 * incluindo validações e regras de negócio para cada campo.
 * Suporta versionamento de disciplinas para manter a integridade dos planos existentes.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Definição do modelo Disciplina com os seguintes campos:
 * 
 * @property {number} id - Identificador único da disciplina (gerado automaticamente)
 * @property {string} nome - Nome da disciplina (obrigatório)
 * @property {string} descricao - Descrição da disciplina (opcional)
 * @property {number} versao - Número da versão da disciplina (default: 1)
 * @property {boolean} ativa - Indica se a disciplina está ativa (default: true)
 * @property {number} disciplina_origem_id - Referência à disciplina original (para versionamento)
 * @property {Date} createdAt - Data de criação do registro (automático)
 * @property {Date} updatedAt - Data da última atualização (automático)
 */
const Disciplina = sequelize.define('Disciplina', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome da disciplina'
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Descrição da disciplina'
  },
  versao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    comment: 'Número da versão da disciplina'
  },
  ativa: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: 'Indica se a disciplina está ativa'
  },
  disciplina_origem_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: 'ID da disciplina original que gerou esta versão'
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
  comment: 'Armazena as disciplinas disponíveis no sistema com suporte a versionamento'
});

// Associação auto-referencial para suporte a versionamento
Disciplina.beforeSync(() => {
  Disciplina.belongsTo(Disciplina, {
    as: 'DisciplinaOrigem',
    foreignKey: 'disciplina_origem_id'
  });
  
  Disciplina.hasMany(Disciplina, {
    as: 'Versoes',
    foreignKey: 'disciplina_origem_id'
  });
});

module.exports = Disciplina; 