var loopback = require('loopback');

module.exports = function (app, done) {
  var dataACLModel = loopback.findModel('DataACLModel');
  dataACLModel.destroyAll({}, { ignoreAutoScope: true }, function (err) {
    var items = [
      {
        name: 'book-d1-p1',
        category: 'book',
        quantity: 200,
        department: 'd1',
        product: 'p1'
      },
      {
        name: 'boasdsadok',
        category: 'book',
        quantity: 500,
        department: 'd1',
        product: 'p2'
      },
      {
        name: 'bo23324432ok',
        category: 'book',
        quantity: 200,
        department: 'd2',
        id: '50023128-5d57-11e6-8b77-86f30ca893d4',
        product: 'p1'
      },
      {
        name: 'item567',
        category: 'book',
        quantity: 200,
        department: 'd9',
        product: 'p2'
      },
      {
        name: 'item568',
        category: 'music',
        quantity: 200,
        department: 'd1',
        product: 'p1'
      },
      {
        name: 'item569',
        category: 'others',
        quantity: 200,
        department: 'd1',
        product: 'p7'
      },
      {
        name: 'itemo600',
        category: 'music',
        quantity: 200,
        department: 'd2',
        product: 'p2'
      },
      {
        name: 'item601',
        category: 'book',
        quantity: 200,
        department: 'd1',
        product: 'p1'
      },
      {
        name: 'item0812341243',
        category: 'music',
        quantity: 200,
        department: 'd3',
        product: 'special1'
      },
      {
        name: 'item888823',
        category: 'special2',
        quantity: 200,
        department: 'd1',
        product: 'special2',
        id: '49023128-5d57-11e6-8b77-86f30ca893d4'
      },
      {
        name: 'powaee3213',
        category: 'others',
        quantity: 200,
        department: 'm1',
        product: 'm3'
      },
      {
        name: 'finance department only',
        category: 'finance',
        quantity: 200,
        department: 'finance',
        product: 'm3'
      },
      {
        name: 'fetchbyid',
        id: '49023128-5d57-11e6-8b77-86f30ca893d3',
        category: 'byid',
        department: 'byid'
      }

    ];
    dataACLModel.create(items, { ctx: { tenantId: "/default" } }, function (err, r) {
      return done();
    });
  });
}

