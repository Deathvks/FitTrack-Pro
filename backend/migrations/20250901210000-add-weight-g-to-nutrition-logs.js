'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('nutrition_logs', 'weight_g', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Peso de la comida en gramos'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('nutrition_logs', 'weight_g');
  }
};