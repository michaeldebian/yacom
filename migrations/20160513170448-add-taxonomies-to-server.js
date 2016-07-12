'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    queryInterface.addColumn('servers', 'appId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'appTaxonomies', key: 'id' },
      onDelete: 'SET NULL'
    });

    queryInterface.addColumn('servers', 'locationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'locationTaxonomies', key: 'id' },
      onDelete: 'SET NULL'
    });

    queryInterface.addColumn('servers', 'environmentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'environmentTaxonomies', key: 'id' },
      onDelete: 'SET NULL'
    });

    queryInterface.addColumn('servers', 'groupId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'serverGroups', key: 'id' },
      onDelete: 'SET NULL'
    });
  },

  down: function (queryInterface, Sequelize) {
    queryInterface.removeColumn('servers', 'appId');
    queryInterface.removeColumn('servers', 'locationId');
    queryInterface.removeColumn('servers', 'environmentId');
    queryInterface.removeColumn('servers', 'groupId');
  }
};
