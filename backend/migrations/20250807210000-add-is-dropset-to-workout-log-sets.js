'use strict';

/** @type {import('sequelize-cli').Migration} */
// --- INICIO DE LA CORRECCIÓN ---
export default {
// --- FIN DE LA CORRECCIÓN ---
  async up (queryInterface, Sequelize) {
    /**
     * Añade la columna 'is_dropset' a la tabla 'workout_log_sets'.
     * Esta columna permitirá marcar si una serie específica fue un dropset.
     */
    await queryInterface.addColumn('workout_log_sets', 'is_dropset', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Revierte la migración eliminando la columna 'is_dropset'.
     */
    await queryInterface.removeColumn('workout_log_sets', 'is_dropset');
  }
};