'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Verificar si la columna ya existe
    const tableDescription = await queryInterface.describeTable('nutrition_logs');
    
    if (!tableDescription.weight_g) {
      await queryInterface.addColumn('nutrition_logs', 'weight_g', {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Peso de la comida en gramos'
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('nutrition_logs');
    
    if (tableDescription.weight_g) {
      await queryInterface.removeColumn('nutrition_logs', 'weight_g');
    }
  }
};