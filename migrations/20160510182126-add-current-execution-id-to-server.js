'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('servers', 'currentExecutionId', {
      type: Sequelize.INTEGER,
      references: { model: 'executions', key: 'id' }
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('servers', 'currentExecutionId');
  }
};
