'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [{
      name: 'Michael',
      surname: 'Dellagranda',
      email: 'mike@yacom.com',
      salt: 'b8129df77f4d04585e0711fc68d03993696a69c87a0d31aaa8ebd028d34c87b67f7a40be868fad4c6a582f655d7e01e2d708989f96db3feca32e75f4bef5ecff8446a15e92d020379524dc9e8ae928a81f23a4f585cb9aa80f0ae8fff07fc2052ab03c10845712d048e58ab5b745525b412d8428fc00042f294829f00d030315',
      hash: '063fe949af006f3fdddaa05a1d3bc9f61706120797676ec25a95d6081a81323eed7c73abb6443fc4014f7e483e6ad1d7a5c301bcd6153f9146666a59908ae2e7dc193f0333f82b3e221791a0409399a0d39b6904f6234eb7c1842715c521faa192cc4d172d479dd26c58d57d2e4e076dda65a241dbdf78c7bf0103ed4039b5dcdb81b0d79c27f40e0a126084bd4f667f75e29cb8308cb56c2c3ebffcb8673a24b9a4bf23b02451953791ad2b931b6c685b84973cd75b00cf2e72b6b88ec8964228769425d0a534b8488d418a9b750e6cdde8c01f2c00d9bd1a8728a7859adbee5cff25014cd5db7282d6510b1a32cb1e4bf8d42119450708bce5db269df16cfc',
      admin: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }]);
  },

  down: function (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {});
  }
};
