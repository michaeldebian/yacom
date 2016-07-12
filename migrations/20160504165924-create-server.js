'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('servers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      osVersion: {
        type: Sequelize.INTEGER
      },
      ipAddress: {
        type: Sequelize.STRING
      },
      serverName: {
        type: Sequelize.STRING
      },
      deployerUser: {
        type: Sequelize.STRING
      },
      osPackages: {
        type: Sequelize.STRING
      },
      developerPackages: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gitUrl: {
        type: Sequelize.STRING
      },
      sshKey: {
        type: Sequelize.TEXT
      },
      pubKey: {
        type: Sequelize.TEXT
      },
      deploymentPath: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('servers');
  }
};
