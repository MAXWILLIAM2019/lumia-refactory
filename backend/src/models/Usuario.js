const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Usuario = sequelize.define('Usuario', {
  IdUsuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    field: 'idusuario'
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'nome'
  },
  cpf: {
    type: DataTypes.STRING(14),
    allowNull: false,
    unique: true,
    field: 'cpf'
  },
  login: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  senha: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  grupo: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'grupo_usuario',
      key: 'idgrupo'
    },
    field: 'grupo'
  },
  situacao: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  ultimo_acesso: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'ultimo_acesso'
  },
  data_senha_alterada: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_senha_alterada'
  },
  data_senha_expirada: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'data_senha_expirada'
  },
  login_secundario: {
    type: DataTypes.STRING(25),
    allowNull: true,
    field: 'login_secundario'
  }
}, {
  tableName: 'usuario',
  timestamps: false // Não usar createdAt/updatedAt automáticos
});

module.exports = Usuario; 