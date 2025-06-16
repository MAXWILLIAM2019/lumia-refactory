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
 * - totalQuestoes: Total de questões na meta
 * - questoesCorretas: Número de questões respondidas corretamente
 * - posicao: Posição da meta na sprint (usado para ordenação)
 *           Cada meta deve ter uma posição única dentro da sua sprint
 *           A posição é gerenciada automaticamente:
 *           - Na instanciação de plano: mantém a mesma posição da meta mestre
 *           - Na criação individual: próxima posição disponível
 *           - Na reordenação: atualizado via controller específico
 * - meta_mestre_id: Referência à meta mestre que originou esta meta
 * 
 * Restrições:
 * - Não pode existir duas metas com a mesma posição na mesma sprint (constraint: sprint_posicao_unique)
 * 
 * Relacionamentos:
 * - belongsTo Sprint: Uma meta pertence a uma sprint
 * - belongsTo MetaMestre: Uma meta pode ter sido originada de uma meta mestre
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
  },
  posicao: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  meta_mestre_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'MetasMestre',
      key: 'id'
    },
    comment: 'Referência à meta mestre que originou esta meta'
  }
}, {
  indexes: [
    {
      unique: true,
      fields: ['SprintId', 'posicao'],
      name: 'sprint_posicao_unique'
    }
  ]
});

// Nota: A definição de relacionamentos foi movida para o arquivo index.js
// para evitar definições duplicadas e problemas de referência circular

module.exports = Meta; 