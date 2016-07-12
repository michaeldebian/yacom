'use strict';
module.exports = function(sequelize, DataTypes) {
  var serverGroup = sequelize.define('serverGroup', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return serverGroup;
};