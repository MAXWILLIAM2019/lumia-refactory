'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Meta', 'desempenho', {
      type: Sequelize.DECIMAL(5,2),
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('Meta', 'desempenho', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });
  }
}; 