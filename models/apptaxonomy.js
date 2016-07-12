'use strict';
module.exports = function(sequelize, DataTypes) {
  var appTaxonomy = sequelize.define('appTaxonomy', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return appTaxonomy;
};