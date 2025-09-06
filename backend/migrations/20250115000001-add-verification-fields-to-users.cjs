'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'verification_code', {
      type: Sequelize.STRING(6),
      allowNull: true,
    });
    
    await queryInterface.addColumn('users', 'verification_code_expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users', 'verification_code');
    await queryInterface.removeColumn('users', 'verification_code_expires_at');
  }
};