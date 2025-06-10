const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const GrupoUsuario = sequelize.define('GrupoUsuario', {
  IdGrupo: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idgrupo'
  },
  nome: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'grupo_usuario',
  timestamps: false
});

module.exports = GrupoUsuario; 