'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('favorite_meals');
    
    if (!tableDescription.weight_g) {
      await queryInterface.addColumn('favorite_meals', 'weight_g', {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Peso de la comida en gramos'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('favorite_meals');
    
    if (tableDescription.weight_g) {
      await queryInterface.removeColumn('favorite_meals', 'weight_g');
    }
  }
};