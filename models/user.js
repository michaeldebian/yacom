'use strict';

const crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define('user', {
    name: {
      type: DataTypes.STRING
    },
    surname: {
      type: DataTypes.STRING
    },
    email: {
      type: DataTypes.STRING
    },
    password: {
      type: DataTypes.VIRTUAL
    },
    salt: {
      type: DataTypes.TEXT
    },
    hash: {
      type: DataTypes.TEXT
    },
    admin: {
      type: DataTypes.BOOLEAN
    }
  }, {
    instanceMethods: {
      getFullName: function() {
        return `${this.name} ${this.surname}`;
      },

      verifyPassword: function(password) {
        return new Promise((resolve, reject) => {
          this.getPasswordHash(password).then(hash => {
            resolve(hash === this.hash);
          }).catch(reject);
        });
      },

      getPasswordHash: function(password) {
        return new Promise((resolve, reject) => {
          crypto.pbkdf2(password, this.salt, 7000, 256, (err, hash) => {
            if (err) {
              reject(err);
            }

            resolve(new Buffer(hash).toString('hex'));
          });
        });
      }
    }
  });

  function encryptPassword(instance, options) {
    if (!instance.password) {
      return;
    }

    return new Promise((resolve, reject) => {
      crypto.randomBytes(128, (err, salt) => {
        if (err) {
          reject(err);
        }

        instance.salt = new Buffer(salt).toString('hex');

        instance.getPasswordHash(instance.password).then(hash => {
          instance.hash = hash;
          resolve();
        }).catch(reject);
      });
    });
  }

  User
    .beforeUpdate(encryptPassword)
    .beforeCreate(encryptPassword);

  return User;
};
