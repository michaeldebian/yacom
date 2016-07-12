'use strict';

const fs = require('fs');
const mkdirp = require('mkdirp');
const scriptGenerator = require('../shared/script-gen');
const Execution = require('./index.js').Execution;
const keygen = require('ssh-keygen');
const validator = require('validator');
const baseUrl = require('../config').baseUrl;
const SCRIPTS_DIR = __dirname + '/../data/scripts/';

mkdirp(SCRIPTS_DIR);

function isUnique(model, value, field, fieldPName, id) {
  return model.findOne({
    where: { [field]: value, $not: {id: id} },
    attributes: ['id']
  }).then(server => {
    if (server) {
      throw new Error(`${fieldPName} already used!`);
    }
  });
}

module.exports = function(sequelize, DataTypes) {
  var Server = sequelize.define('server', {
    osVersion: DataTypes.INTEGER,
    ipAddress: {
      type: DataTypes.STRING,
      validate: {
        isIP: true,
        isUnique: function(value) {
          return isUnique(Server, value, 'ipAddress', 'IP Address', this.id);
        }
      }
    },
    email: {
      type: DataTypes.STRING
    },
    serverName: {
      type: DataTypes.STRING,
      validate: {
        isUnique: function(value) {
          return isUnique(Server, value, 'serverName', 'Server name', this.id);
        },
        isNotIP: function(value) {
          if (validator.isIP(value)) {
            throw new Error('The server name cannot be an IP address.');
          }
        }
      }
    },
    appId: {
      type: DataTypes.INTEGER,
      references: { model: 'appTaxonomies', key: 'id' }
    },
    locationId: {
      type: DataTypes.INTEGER,
      references: { model: 'locationTaxonomies', key: 'id' }
    },
    environmentId: {
      type: DataTypes.INTEGER,
      references: { model: 'environmentTaxonomies', key: 'id' }
    },
    groupId: {
      type: DataTypes.INTEGER,
      references: { model: 'serverGroups', key: 'id' }
    },
    osPackages: DataTypes.STRING,
    deployerUser: DataTypes.STRING,
    developerPackages: DataTypes.STRING,
    deploymentPath: DataTypes.STRING,
    gitUrl: DataTypes.STRING,
    sshKey: DataTypes.TEXT,
    pubKey: DataTypes.TEXT,
    currentExecutionId: {
      type: DataTypes.INTEGER,
      references: { model: 'executions', key: 'id' }
    }
  }, {
    instanceMethods: {
      getScriptPath: function() {
        return SCRIPTS_DIR + this.id;
      },

      getStatus: function() {
        if (this.currentExecutionId) {
          if (this.currentExecution.exitCode === null) {
            return 'Running';
          } else if (this.currentExecution.exitCode === 0)  {
            return 'Success';
          } else {
            return 'Error';
          }
        } else {
          return 'Pending';
        }
      }
    },

    getterMethods: {
      scriptCommand: function() {
        return `curl -o- ${baseUrl}/servers/${this.serverName.replace(/\s/g, '-')}/sh | bash`;
      }
    },

    classMethods: {
      associate: (models) => {
        Server.belongsTo(models.execution, { as: 'currentExecution' });
        Server.hasMany(models.execution, { onDelete: 'CASCADE' });
        Server.belongsTo(models.appTaxonomy, { as: 'app', onDelete: 'SET NULL' });
        Server.belongsTo(models.locationTaxonomy, { as: 'location', onDelete: 'SET NULL' });
        Server.belongsTo(models.environmentTaxonomy, { as: 'environment', onDelete: 'SET NULL' });
        Server.belongsTo(models.serverGroup, { as: 'group', onDelete: 'SET NULL' });
      }
    }
  });

  function renderAndSaveScript(server) {
    fs.writeFile(server.getScriptPath(), scriptGenerator.renderScript(server));
  }

  Server
    // Script
    .afterCreate(renderAndSaveScript)
    .afterUpdate(renderAndSaveScript)

    // RSA KEY
    .beforeCreate(server => {
      return new Promise((resolve, reject) => {
        keygen({}, (err, out) => {
          if (err) {
            return reject(err);
          }

          server.sshKey = out.key;
          server.pubKey = out.pubKey;
          resolve(server);
        });
      });
    });

  return Server;
};
