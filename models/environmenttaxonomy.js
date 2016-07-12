'use strict';
module.exports = function(sequelize, DataTypes) {
  var environmentTaxonomy = sequelize.define('environmentTaxonomy', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return environmentTaxonomy;
};