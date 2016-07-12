'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('executions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      exitCode: Sequelize.INTEGER,
      stage: {
        type: Sequelize.ENUM('os-packages', 'dev-packages', 'project-setup')
      },
      serverId: {
        type: Sequelize.INTEGER,
        references: { model: 'servers', key: 'id' },
        onDelete: 'CASCADE'
      },
      log: {
        type: Sequelize.TEXT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('executions');
  }
};
