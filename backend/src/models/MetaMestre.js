const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Modelo MetaMestre
 * Representa uma meta mestre (template) que pode ser usada para gerar metas de alunos
 * 
 * Campos:
 * - disciplina: Nome da disciplina (texto livre)
 * - tipo: Tipo da meta (teoria, questoes, revisao, reforco)
 * - titulo: Título da meta (seria o "assunto")
 * - comandos: Comandos ou instruções específicas para a meta
 * - link: Link de referência para a meta
 * - relevancia: Nível de relevância (1-5)
 * - SprintMestreId: ID da sprint mestre à qual pertence
 * 
 * Relacionamentos:
 * - belongsTo SprintMestre: Uma meta mestre pertence a uma sprint mestre
 * - hasMany Meta: Uma meta mestre pode gerar várias instâncias de metas
 */
const MetaMestre = sequelize.define('MetaMestre', {
  disciplina: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  titulo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  comandos: {
    type: DataTypes.STRING,
    allowNull: true
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  relevancia: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1, max: 5 }
  },
  SprintMestreId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'SprintMestreId'
  }
}, {
  tableName: 'MetasMestre',
  timestamps: true
});

module.exports = MetaMestre; 