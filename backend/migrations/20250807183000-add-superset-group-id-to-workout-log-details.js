'use strict';

/** @type {import('sequelize-cli').Migration} */
// --- INICIO DE LA CORRECCIÓN ---
export default {
// --- FIN DE LA CORRECCIÓN ---
  async up (queryInterface, Sequelize) {
    /**
     * Añade la columna 'superset_group_id' a la tabla 'workout_log_details'.
     * Esta columna almacenará el identificador del grupo de superserie, permitiendo
     * agrupar los ejercicios en el historial de entrenamientos.
     */
    await queryInterface.addColumn('workout_log_details', 'superset_group_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'best_set_weight' // Se añade después de la columna 'best_set_weight' por orden.
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Revierte la migración eliminando la columna 'superset_group_id'.
     */
    await queryInterface.removeColumn('workout_log_details', 'superset_group_id');
  }
};