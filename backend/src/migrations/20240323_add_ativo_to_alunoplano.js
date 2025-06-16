'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('AlunoPlano', 'ativo', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      after: 'observacoes'
    });

    // Atualizar registros existentes para ativo = true
    await queryInterface.sequelize.query(
      'UPDATE AlunoPlano SET ativo = true WHERE ativo IS NULL'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('AlunoPlano', 'ativo');
  }
}; 