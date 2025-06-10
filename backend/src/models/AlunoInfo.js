const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AlunoInfo = sequelize.define('AlunoInfo', {
  IdAlunoInfo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idalunoinfo'
  },
  IdUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'usuario',
      key: 'idusuario'
    },
    field: 'idusuario'
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: true
  },
  data_nascimento: {
    type: DataTypes.DATE,
    allowNull: true
  },
  data_criacao: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'aluno_info',
  timestamps: false
});

module.exports = AlunoInfo; 