'use strict';

/** @type {import('sequelize-cli').Migration} */
// --- INICIO DE LA CORRECCIÓN ---
// Se cambia 'module.exports' por 'export default' para que sea compatible con ES Modules.
export default {
// --- FIN DE LA CORRECCIÓN ---
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('nutrition_logs', 'log_date', {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    // Revertir a DATETIME si es necesario
    await queryInterface.changeColumn('nutrition_logs', 'log_date', {
      type: Sequelize.DATE,
      allowNull: false,
    });
  }
};