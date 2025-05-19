/**
 * Modelo Aluno
 * 
 * Representa um aluno do sistema com seus dados cadastrais.
 * Este modelo define a estrutura da tabela Aluno no banco de dados,
 * incluindo validações e regras de negócio para cada campo.
 */
const { DataTypes } = require('sequelize');
const sequelize = require('../db');

/**
 * Definição do modelo Aluno com os seguintes campos:
 * 
 * @property {number} id - Identificador único do aluno (gerado automaticamente)
 * @property {string} nome - Nome completo do aluno (obrigatório)
 * @property {string} email - Email do aluno (obrigatório, único, formato válido)
 * @property {string} cpf - CPF do aluno (obrigatório, único)
 * @property {string} senha - Senha criptografada do aluno
 * @property {Date} createdAt - Data de criação do registro (automático)
 * @property {Date} updatedAt - Data da última atualização (automático)
 */
const Aluno = sequelize.define('Aluno', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'Nome completo do aluno'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'O email fornecido não é válido'
      }
    },
    comment: 'Email do aluno (único e com formato válido)'
  },
  cpf: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: 'CPF do aluno (único, sem formatação)'
  },
  senha: {
    type: DataTypes.STRING,
    allowNull: true, // Pode ser nulo inicialmente para migração suave
    comment: 'Senha criptografada do aluno'
  }
}, {
  timestamps: true, // Adiciona createdAt e updatedAt
  comment: 'Armazena os dados de alunos do sistema de mentoria'
});

module.exports = Aluno; 