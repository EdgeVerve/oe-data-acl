var oecloud = require('oe-cloud');
var loopback = require('loopback');

oecloud.observe('loaded', function (ctx, next) {
  console.log("oe-cloud modules loaded");
  return next();
})


oecloud.boot(__dirname, function (err) {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  oecloud.start();
  oecloud.emit('test-start');
});



var chalk = require('chalk');
var chai = require('chai');
var async = require('async');
chai.use(require('chai-things'));

var expect = chai.expect;

var app = oecloud;
var defaults = require('superagent-defaults');
var supertest = require('supertest');
var Customer;
var api = defaults(supertest(app));
var basePath = app.get('restApiRoot');


describe(chalk.blue('data-acl-test'), function () {

  var modelName = 'DataACLModel';

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

  var user3 = {
    'username': 'foo3',
    'password': 'bar3',
    'email': 'foo3@gmail.com'
  };

  var user1token;
  var user2token;
  var user3token;

  this.timeout(10000);
  before('wait for boot scripts to complete', function (done) {
    app.on('test-start', function () {
      done();
    });
  });

  it('login1', function (done) {
    var postData = {
      'username': user1.username,
      'password': user1.password
    };

    var postUrl = basePath + '/Users/login';
    api.set('Accept', 'application/json')
      .set('tenant_id', 'test-tenant')
      .post(postUrl)
      .send(postData)
      .expect(200).end(function (err, response) {
        user1token = response.body.id;
        done();
      });
  });

  it('fetch1', function (done) {
    var url = basePath + '/' + modelName + 's?access_token=' + user1token;
    api
      .get(url)
      .expect(200).end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        response.forEach(function (item) {
          expect((item.category === 'book' ||
            item.category === 'music') &&
            (item.department === 'd1' ||
              item.department === 'd2')).to.be.true;
        });

        done();
      });
  });

  it('fetch with filter', function (done) {
    var filter = { where: { category: 'book' } };

    var url = basePath + '/' + modelName + 's?access_token=' + user1token + '&filter=' + JSON.stringify(filter);
    api
      .get(url)
      .expect(200).end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        response.forEach(function (item) {
          expect((item.category === 'book') &&
            (item.department === 'd1' ||
              item.department === 'd2')).to.be.true;
        });

        done();
      });
  });

  it('login2', function (done) {
    var postData = {
      'username': user2.username,
      'password': user2.password
    };

    var postUrl = basePath + '/Users/login';

    api.set('Accept', 'application/json')
      .set('tenant_id', 'test-tenant')
      .post(postUrl)
      .send(postData)
      .expect(200).end(function (err, response) {
        user2token = response.body.id;
        done();
      });
  });

  it('fetch2', function (done) {
    var url = basePath + '/' + modelName + 's?access_token=' + user2token;
    api
      .get(url)
      .expect(200).end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        response.forEach(function (item) {
          expect(item.product === 'special1' ||
            item.product === 'special2' ||
            item.department === 'finance' ||
            item.category === 'others').to.be.true;
        });
        done();
      });
  });


  it('fetchbyid - not permissioned', function (done) {
    var url = basePath + '/' + modelName + 's/49023128-5d57-11e6-8b77-86f30ca893d3?access_token=' + user2token;
    api
      .get(url)
      .expect(404).end(function (err, res) {
        var response = res.body;
        expect(response.error.code === 'MODEL_NOT_FOUND').to.be.true;
        done();
      });
  });

  it('fetchbyid - permissioned', function (done) {
    var url = basePath + '/' + modelName + 's/49023128-5d57-11e6-8b77-86f30ca893d4?access_token=' + user2token;
    api
      .get(url)
      .expect(200).end(function (err, res) {
        var response = res.body;
        expect(response.id === '49023128-5d57-11e6-8b77-86f30ca893d4').to.be.true;
        done();
      });
  });

  it('fetch and delete', function (done) {
    var url = basePath + '/' + modelName + 's/50023128-5d57-11e6-8b77-86f30ca893d4/?access_token=' + user1token;
    api
      .get(url)
      .expect(200).end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response._version).not.to.be.null;
        api.del(url, function (err, res) {
          expect(res.status).to.be.equal(200);
          expect(res.body.count).to.be.equal(1);
          done();

        });
      });
  });

  it('Create DataACL on unknown Model should throw error', function (done) {
    var dataACL = loopback.findModel('DataACL');
    var data = {
      model: 'NON_EXISTING_MODEL',
      principalType: 'ROLE',
      principalId: 'ROLEB',
      accessType: 'READ',
      filter: { 'department': 'finance' }
    };

    dataACL.create(data, {}, function (err, res) {
      expect(err.message).to.be.equal("Model 'NON_EXISTING_MODEL' doesn't exists.");
      done();
    })
  });

  it('login3', function (done) {
    var postData = {
      'username': user3.username,
      'password': user3.password
    };

    var postUrl = basePath + '/Users/login';

    api.set('Accept', 'application/json')
      .set('tenant_id', 'test-tenant')
      .post(postUrl)
      .send(postData)
      .expect(200).end(function (err, response) {
        user3token = response.body.id;
        done();
      });
  });

  it('Executing DataACL for @ctx in DataACL filter property but ctx is not passed', function (done) {
    var data = {
      name: 'fetchbyid_new',
      id: '49023128-5d57-11e6-8b77-86f30ca893d3',
      category: 'byid',
      department: 'byid'
    }
    var url = basePath + '/' + modelName + 's/49023128-5d57-11e6-8b77-86f30ca893d3/?access_token=' + user2token;
    api
      .put(url)
      .send(data)
      .end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response.error).to.exist;
        done();
      });
  });

  it('Executing DataACL for WRITE access type', function (done) {
    var data = {
      name: 'fetchbyid_new',
      id: '49023128-5d57-11e6-8b77-86f30ca893d3',
      category: 'byid',
      department: 'byid'
    };

    var url = basePath + '/' + modelName + 's/49023128-5d57-11e6-8b77-86f30ca893d3/?access_token=' + user3token;
    api
      .put(url)
      .send(data)
      .end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response.error).to.exist;
        done();
      });
  });

  it('Executing DataACL for WRITE access type', function (done) {
    var data = {
      name: 'Fluid Mechanics',
      category: 'mech',
      department: 'engg',
      id:'mech_engg'
    };

    var url = basePath + '/' + modelName + 's/?access_token=' + user3token;
    api
      .post(url)
      .send(data)
      .end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response.id).to.be.equal('mech_engg');
        done();
      });
  });

  it('Executing DataACL for WRITE access type', function (done) {
    var data = {
      name: 'Fluid Mechanics Vol2',
      category: 'mech',
      department: 'engg',
      id:'mech_engg'
    };

    var url = basePath + '/' + modelName + 's/?access_token=' + user3token;
    api
      .put(url)
      .send(data)
      .end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response.id).to.be.equal('mech_engg');
        done();
      });
  });

  it('Executing DataACL for READ access type Executing DataACL for @cc in DataACL filter property but ctx is not passed', function (done) {
    var url = basePath + '/' + modelName + 's/?access_token=' + user3token;
    api
      .get(url)
      .end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response.error).to.exist;
        done();
      });
  });

  it('Executing DataACL for WRITE access type', function (done) {
    var data = {
      name: 'Fluid Mechanics Vol3'
    };

    var url = basePath + '/' + modelName + 's/mech_engg/?access_token=' + user3token;
    api
      .patch(url)
      .send(data)
      .end(function (err, res) {
        var response = res.body;
        expect(response).to.exist;
        expect(response.id).to.be.equal('mech_engg');
        done();
      });
  });

});

