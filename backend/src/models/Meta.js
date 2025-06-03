const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Sprint = require('./Sprint');

/**
 * Modelo Meta
 * Representa uma meta de estudo dentro de uma sprint
 * 
 * Campos:
 * - disciplina: Nome da disciplina (ex: "Matemática")
 * - tipo: Tipo da meta (teoria, questoes, revisao, reforco)
 * - titulo: Título da meta
 * - comandos: Comandos ou instruções específicas para a meta
 * - link: Link de referência para a meta
 * - relevancia: Nível de relevância (1-5)
 * - tempoEstudado: Tempo gasto na meta (formato: "HH:MM")
 * - desempenho: Pontuação de desempenho (0-100)
 * - status: Status da meta (Pendente, Em Andamento, Concluída)
 * 
 * Relacionamentos:
 * - belongsTo Sprint: Uma meta pertence a uma sprint
 */
const Meta = sequelize.define('Meta', {
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
    type: DataTypes.DECIMAL(5,2),
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('Pendente', 'Em Andamento', 'Concluída'),
    defaultValue: 'Pendente'
  },
  totalQuestoes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  questoesCorretas: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
});

// Nota: A definição de relacionamentos foi movida para o arquivo index.js
// para evitar definições duplicadas e problemas de referência circular

module.exports = Meta; 