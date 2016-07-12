'use strict';

module.exports = function(sequelize, DataTypes) {
  var Execution = sequelize.define('execution', {
    exitCode: DataTypes.INTEGER,
    stage: DataTypes.ENUM('os-packages', 'dev-packages', 'project-setup'),
    log: DataTypes.TEXT,
    serverId: {
      type: DataTypes.INTEGER,
      references: { model: 'servers', key: 'id' }
    }
  }, {
    classMethods: {
      associate: (models) => {
        Execution.belongsTo(models.server, { onDelete: 'CASCADE', foreignKey: 'serverId' });
      }
    }
  });

  return Execution;
};
