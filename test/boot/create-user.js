var loopback = require('loopback');
var async = require('async');

module.exports = function (app, done) {
  var userModel = loopback.getModelByType("User");
  var role = loopback.getModelByType('Role');
  var roleMapping = loopback.getModelByType('RoleMapping');
  var user1 = {
    'username': 'foo',
    'password': 'bar',
    'email': 'foo@gmail.com'
  };

  var user2 = {
    'username': 'foo2',
    'password': 'bar2',
    'email': 'foo2@gmail.com'
  };

  var defaultContext = { ctx: { tenantId: "/default" } };
  async.series([function (callback) {
    userModel.create(user1, defaultContext, function (err, result) {
      var user = result;
      role.create({ name: "ROLEA" }, defaultContext, function (err, res) {
        var dbRole = res;
        var mapping = {};
        mapping.principalId = user.id;
        mapping.principalType = 'USER';
        mapping.roleId = dbRole.id;
        roleMapping.create(mapping, defaultContext, function (err, res) {
          callback();
        });
      });
    });
  }, function (callback) {
    userModel.create(user2, defaultContext, function (err, result) {
      var user = result;
      role.create({ name: "ROLEB" }, defaultContext, function (err, res) {
        var dbRole = res;
        var mapping = {};
        mapping.principalId = user.id;
        mapping.principalType = 'USER';
        mapping.roleId = dbRole.id;
        roleMapping.create(mapping, defaultContext, function (err, res) {
          callback();
        });
      });
    });
  }], function () {
    done();
  });

}

