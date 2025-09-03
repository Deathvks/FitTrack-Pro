'use strict';

/** @type {import('sequelize-cli').Migration} */
// --- INICIO DE LA CORRECCIÓN ---
export default {
// --- FIN DE LA CORRECCIÓN ---
  async up (queryInterface, Sequelize) {
    // Columna para agrupar ejercicios en una superserie
    await queryInterface.addColumn('routine_exercises', 'superset_group_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'ID to group exercises into a superset'
    });
    // Columna para ordenar los ejercicios dentro de una superserie
    await queryInterface.addColumn('routine_exercises', 'exercise_order', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Order of the exercise within a superset group'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('routine_exercises', 'superset_group_id');
    await queryInterface.removeColumn('routine_exercises', 'exercise_order');
  }
};