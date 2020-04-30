var loopback = require('loopback');

module.exports = function (app, done) {
  var dataAcl = loopback.findModel('DataACL');
  var modelName = 'DataACLModel';
  var dataacls = [
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEA',
      accessType: 'READ',
      group: 'category',
      filter: { 'category': 'book' }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEA',
      accessType: 'READ',
      group: 'category',
      filter: { 'category': 'music' }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEA',
      accessType: 'READ',
      group: 'department',
      filter: { 'department': { 'inq': ['d1', 'd2'] } }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEB',
      accessType: 'READ',
      filter: { 'category': 'others' }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEB',
      accessType: 'READ',
      filter: { 'product': { 'inq': ['special1', 'special2'] } }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEB',
      accessType: 'READ',
      filter: { 'department': 'finance' }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEB',
      accessType: 'WRITE',
      filter: { 'department': '@ctx.department.deptId' }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEC',
      accessType: 'READ',
      filter: { 'department': '@CC.dept' }
    },
    {
      model: modelName,
      principalType: 'ROLE',
      principalId: 'ROLEC',
      accessType: 'WRITE',
      filter: { 'department': 'engg' }
    }
  ];
  dataAcl.destroyAll({}, { ignoreAutoScope: true }, function (err) {
    dataAcl.create(dataacls, { ctx: { tenantId: '/default' } }, function (err, r) {
      return done();
    });
  });
};

