'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('favorite_meals', 'weight_g', {
      type: Sequelize.DECIMAL(8, 2),
      allowNull: true,
      comment: 'Peso de la comida en gramos'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('favorite_meals', 'weight_g');
  }
};