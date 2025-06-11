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
const Usuario = require('./Usuario');
const Plano = require('./Plano');

/**
 * Definição do modelo AlunoPlano com os seguintes campos:
 * 
 * @property {number} IdUsuario - ID do usuário/aluno (chave estrangeira para usuario)
 * @property {number} PlanoId - ID do plano (chave estrangeira para planos)
 * @property {Date} dataInicio - Data de início do plano para o aluno
 * @property {Date} dataPrevisaoTermino - Data prevista para término
 * @property {Date} dataConclusao - Data efetiva de conclusão (null se não concluído)
 * @property {number} progresso - Percentual de progresso no plano (0-100)
 * @property {string} status - Status atual (em andamento, concluído, etc.)
 * @property {Date} createdAt - Data de criação do registro (automático)
 * @property {Date} updatedAt - Data da última atualização (automático)
 */
const AlunoPlano = sequelize.define('AlunoPlano', {
  IdUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'usuario',
      key: 'idusuario'
    },
    field: 'idusuario',
    comment: 'ID do usuário/aluno (chave estrangeira para usuario)'
  },
  PlanoId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'planos',
      key: 'id'
    },
    field: 'PlanoId',
    comment: 'ID do plano (chave estrangeira para planos)'
  },
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
  comment: 'Associação entre alunos (usuario) e planos com dados de progresso'
});

// Adicionar relações diretas para facilitar queries
AlunoPlano.belongsTo(Usuario, { foreignKey: 'IdUsuario', as: 'usuario' });
AlunoPlano.belongsTo(Plano, { foreignKey: 'PlanoId', as: 'plano' });

module.exports = AlunoPlano; 