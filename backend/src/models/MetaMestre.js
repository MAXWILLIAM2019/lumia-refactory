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
 * - tempoEstudado: Tempo estimado (para compatibilidade com frontend)
 * - desempenho: Performance esperada (para compatibilidade com frontend)
 * - status: Status do template (para compatibilidade com frontend)
 * - totalQuestoes: Total de questões planejadas (para compatibilidade com frontend)
 * - questoesCorretas: Meta de questões corretas (para compatibilidade com frontend)
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
    type: DataTypes.ENUM('teoria', 'questoes', 'revisao', 'reforco'),
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
  tempoEstudado: {
    type: DataTypes.STRING,
    defaultValue: '00:00',
    allowNull: true,
    comment: 'Tempo estimado para esta meta (formato: HH:MM) - usado para compatibilidade com frontend'
  },
  desempenho: {
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0,
    allowNull: true,
    comment: 'Performance esperada para esta meta (0-100) - usado para compatibilidade com frontend'
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    defaultValue: 'Pendente',
    allowNull: false,
    comment: 'Status do template (para compatibilidade com frontend, templates sempre Pendente)'
  },
  totalQuestoes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true,
    comment: 'Total de questões planejadas para esta meta - usado para compatibilidade com frontend'
  },
  questoesCorretas: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: true,
    comment: 'Meta de questões corretas para esta meta - usado para compatibilidade com frontend'
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