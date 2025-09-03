'use strict';

/** @type {import('sequelize-cli').Migration} */
// --- INICIO DE LA CORRECCIÓN ---
export default {
// --- FIN DE LA CORRECCIÓN ---
  async up(queryInterface, Sequelize) {
    // 1. Tabla de Usuarios
    await queryInterface.createTable('users', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      name: { type: Sequelize.STRING(255), allowNull: true },
      role: { type: Sequelize.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
      gender: { type: Sequelize.ENUM('male', 'female', 'other'), allowNull: true },
      age: { type: Sequelize.INTEGER, allowNull: true },
      height: { type: Sequelize.INTEGER, allowNull: true },
      activity_level: { type: Sequelize.DECIMAL(4, 3), allowNull: true },
      goal: { type: Sequelize.ENUM('lose', 'maintain', 'gain'), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });

    // 2. Tabla Maestra de Ejercicios
    await queryInterface.createTable('exercise_list', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
      muscle_group: { type: Sequelize.STRING(100), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      video_url: { type: Sequelize.STRING(255), allowNull: true },
    });

    // 3. Tabla de Rutinas
    await queryInterface.createTable('routines', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      name: { type: Sequelize.STRING(255), allowNull: false },
      description: { type: Sequelize.TEXT, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP') },
    });

    // 4. Tabla de Ejercicios de Rutina (Tabla intermedia)
    await queryInterface.createTable('routine_exercises', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      routine_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'routines', key: 'id' }, onDelete: 'CASCADE' },
      exercise_list_id: { type: Sequelize.INTEGER, allowNull: true, references: { model: 'exercise_list', key: 'id' }, onDelete: 'SET NULL' },
      name: { type: Sequelize.STRING(255), allowNull: false },
      muscle_group: { type: Sequelize.STRING(100), allowNull: true },
      sets: { type: Sequelize.INTEGER, allowNull: false },
      reps: { type: Sequelize.STRING(50), allowNull: false },
    });

    // 5. Tabla de Logs de Entrenamiento
    await queryInterface.createTable('workout_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      routine_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: 'routines', key: 'id' },
        onDelete: 'SET NULL',
      },
      routine_name: { type: Sequelize.STRING(255), allowNull: false },
      workout_date: { type: Sequelize.DATE, allowNull: false },
      duration_seconds: { type: Sequelize.INTEGER, allowNull: false },
      calories_burned: { type: Sequelize.INTEGER, allowNull: true },
      notes: { type: Sequelize.TEXT, allowNull: true },
    });

    // 6. Tabla de Detalles del Log de Entrenamiento
    await queryInterface.createTable('workout_log_details', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      workout_log_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'workout_logs', key: 'id' }, onDelete: 'CASCADE' },
      exercise_name: { type: Sequelize.STRING(255), allowNull: false },
      total_volume: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
      best_set_weight: { type: Sequelize.DECIMAL(6, 2), allowNull: true },
    });

    // 7. Tabla de Series del Log de Entrenamiento
    await queryInterface.createTable('workout_log_sets', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      log_detail_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'workout_log_details', key: 'id' }, onDelete: 'CASCADE' },
      set_number: { type: Sequelize.INTEGER, allowNull: false },
      reps: { type: Sequelize.INTEGER, allowNull: false },
      weight_kg: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
    });

    // 8. Tabla de Logs de Peso Corporal
    await queryInterface.createTable('body_weight_logs', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      weight_kg: { type: Sequelize.DECIMAL(5, 2), allowNull: false },
      log_date: { type: Sequelize.DATE, allowNull: false },
    });

    // 9. Tabla de Récords Personales
    await queryInterface.createTable('personal_records', {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      user_id: { type: Sequelize.INTEGER, allowNull: false, references: { model: 'users', key: 'id' }, onDelete: 'CASCADE' },
      exercise_name: { type: Sequelize.STRING(255), allowNull: false },
      weight_kg: { type: Sequelize.DECIMAL(6, 2), allowNull: false },
      date: { type: Sequelize.DATE, allowNull: false },
    });
  },

  async down(queryInterface, Sequelize) {
    // El orden de borrado es inverso al de creación
    await queryInterface.dropTable('personal_records');
    await queryInterface.dropTable('body_weight_logs');
    await queryInterface.dropTable('workout_log_sets');
    await queryInterface.dropTable('workout_log_details');
    await queryInterface.dropTable('workout_logs');
    await queryInterface.dropTable('routine_exercises');
    await queryInterface.dropTable('routines');
    await queryInterface.dropTable('exercise_list');
    await queryInterface.dropTable('users');
  }
};