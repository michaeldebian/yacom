'use strict';
module.exports = function(sequelize, DataTypes) {
  var locationTaxonomy = sequelize.define('locationTaxonomy', {
    name: DataTypes.STRING
  }, {
    classMethods: {
      associate: function(models) {
        // associations can be defined here
      }
    }
  });
  return locationTaxonomy;
};