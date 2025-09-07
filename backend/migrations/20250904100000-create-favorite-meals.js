'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('favorite_meals', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      calories: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      protein_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      carbs_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      fats_g: {
        type: Sequelize.DECIMAL(6, 2),
        allowNull: true,
      },
      // --- INICIO DE LA MODIFICACIÓN ---
      weight_g: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        comment: 'Peso de la comida en gramos'
      },
      // --- FIN DE LA MODIFICACIÓN ---
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // Añadimos un índice para asegurar que un usuario no pueda tener dos comidas favoritas con el mismo nombre
    await queryInterface.addConstraint('favorite_meals', {
      fields: ['user_id', 'name'],
      type: 'unique',
      name: 'user_meal_name_unique_constraint',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('favorite_meals');
  }
};