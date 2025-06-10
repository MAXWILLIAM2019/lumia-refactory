const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const AdministradorInfo = sequelize.define('AdministradorInfo', {
  IdAdminInfo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idadmininfo'
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
  tableName: 'administrador_info',
  timestamps: false
});

module.exports = AdministradorInfo; 