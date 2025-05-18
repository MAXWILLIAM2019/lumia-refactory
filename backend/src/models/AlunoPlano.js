/**
 * Modelo AlunoPlano
 * 
 * Representa a associação entre um aluno e um plano de estudos.
 * Armazena informações sobre o progresso do aluno no plano.
 * 
 * NOTA DE IMPLEMENTAÇÃO:
 * Embora este modelo use uma estrutura many-to-many (belongsToMany), 
 * a lógica de negócio atual implementa uma relação 1:1, onde:
 * - Um aluno tem no máximo um plano ativo
 * - Um plano pode estar associado a vários alunos
 * 
 * Para expansão futura para N:N completo, basta remover as validações
 * que limitam um aluno a ter apenas um plano ativo no controlador.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const Aluno = require('./Aluno');
const Plano = require('./Plano');

/**
 * Definição do modelo AlunoPlano com os seguintes campos:
 * 
 * @property {number} alunoId - ID do aluno (chave estrangeira)
 * @property {number} planoId - ID do plano (chave estrangeira)
 * @property {Date} dataInicio - Data de início do plano para o aluno
 * @property {Date} dataPrevisaoTermino - Data prevista para término
 * @property {Date} dataConclusao - Data efetiva de conclusão (null se não concluído)
 * @property {number} progresso - Percentual de progresso no plano (0-100)
 * @property {string} status - Status atual (em andamento, concluído, etc.)
 * @property {Date} createdAt - Data de criação do registro (automático)
 * @property {Date} updatedAt - Data da última atualização (automático)
 */
const AlunoPlano = sequelize.define('AlunoPlano', {
  dataInicio: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    comment: 'Data de início do plano para o aluno'
  },
  dataPrevisaoTermino: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data prevista para término do plano'
  },
  dataConclusao: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Data efetiva de conclusão (null se não concluído)'
  },
  progresso: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    },
    comment: 'Percentual de progresso no plano (0-100)'
  },
  status: {
    type: DataTypes.ENUM('não iniciado', 'em andamento', 'concluído', 'cancelado'),
    allowNull: false,
    defaultValue: 'não iniciado',
    comment: 'Status atual do progresso do aluno'
  },
  observacoes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Observações adicionais sobre o progresso do aluno'
  }
}, {
  timestamps: true,
  comment: 'Associação entre alunos e planos com dados de progresso'
});

// Estabelecer as relações
Aluno.belongsToMany(Plano, { through: AlunoPlano, as: 'planos' });
Plano.belongsToMany(Aluno, { through: AlunoPlano, as: 'alunos' });

// Adicionar relações diretas para facilitar queries
AlunoPlano.belongsTo(Aluno);
AlunoPlano.belongsTo(Plano);

module.exports = AlunoPlano; 