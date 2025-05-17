const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Sprint = require('./Sprint');

/**
 * Modelo Atividade
 * Representa uma atividade de estudo dentro de uma sprint
 * 
 * Campos:
 * - disciplina: Nome da disciplina (ex: "Matemática")
 * - tipo: Tipo da atividade (teoria, questoes, revisao, reforco)
 * - titulo: Título da atividade
 * - comandos: Comandos ou instruções específicas para a atividade
 * - link: Link de referência para a atividade
 * - relevancia: Nível de relevância (1-5)
 * - tempoEstudado: Tempo gasto na atividade (formato: "HH:MM")
 * - desempenho: Pontuação de desempenho (0-100)
 * - status: Status da atividade (Pendente, Em Andamento, Concluída)
 * 
 * Relacionamentos:
 * - belongsTo Sprint: Uma atividade pertence a uma sprint
 */
const Atividade = sequelize.define('Atividade', {
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
    validate: {
      min: 1,
      max: 5
    }
  },
  tempoEstudado: {
    type: DataTypes.STRING,
    defaultValue: '00:00'
  },
  desempenho: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    defaultValue: 'Pendente'
  }
});

// Definir relacionamento com o alias correto
Sprint.hasMany(Atividade, { as: 'atividades' });
Atividade.belongsTo(Sprint);

module.exports = Atividade; 