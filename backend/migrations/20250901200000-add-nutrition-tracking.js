'use strict';

/** @type {import('sequelize-cli').Migration} */
// --- INICIO DE LA CORRECCIÓN ---
export default {
// --- FIN DE LA CORRECCIÓN ---
  async up(queryInterface, Sequelize) {
    // 1. Tabla para registrar comidas
    await queryInterface.createTable('nutrition_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      log_date: { type: Sequelize.DATE, allowNull: false },
      meal_type: { type: Sequelize.ENUM('breakfast', 'lunch', 'dinner', 'snack'), allowNull: false },
      description: { type: Sequelize.STRING(255), allowNull: false },
      calories: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      protein_g: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
      carbs_g: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
      fats_g: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    // 2. Tabla para registrar la ingesta de agua diaria
    await queryInterface.createTable('water_logs', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
        log_date: { type: Sequelize.DATEONLY, allowNull: false },
        quantity_ml: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
    });
    
    // Añadir un índice único para user_id y log_date en water_logs
    await queryInterface.addConstraint('water_logs', {
        fields: ['user_id', 'log_date'],
        type: 'unique',
        name: 'user_date_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('nutrition_logs');
    await queryInterface.dropTable('water_logs');
  }
};