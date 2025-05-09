const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Administrador = sequelize.define('Administrador', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cargo: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

module.exports = Administrador; 