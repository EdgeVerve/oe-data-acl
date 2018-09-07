/**
 *
 * ©2016-2017 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 *
 */
/**
 * This boot script brings the ability to apply data ACL to the model.
 *
 * @memberof Boot Scripts
 * @author Pradeep Kumar Tippa
 * @name DataACL
 */
var loopback = require('loopback');
var log = require('oe-logger')('data-acl-boot');

// var messaging = require('../../lib/common/global-messaging');

var dataACLModel;

module.exports = function DataACL(app, cb) {
  log.debug(log.defaultContext(), 'In data-acl.js boot script.');
  dataACLModel = app.models.DataACL;
  // Creating 'before save' and 'after save' observer hooks for DataACL
  dataACLModel.observe('before save', dataACLBeforeSave);
  dataACLModel.observe('after save', dataACLAfterSave);
  // TODO: Need to check whether to introduce 'disabled' property for DataACL
  var filter = {};
  dataACLModel.find(filter, options, function (err, results) {
    log.debug(log.defaultContext(), 'dataACLModel.find executed.');
    if (err) {
      log.error(log.defaultContext(), 'dataACLModel.find error. Error', err);
      cb(err);
    } else if (results && results.length > 0) {
      // The below code for the if clause will not executed for test cases with clean/empty DB.
      // In order to execute the below code and get code coverage for it we should have
      // some rules defined for some models in the database before running tests for coverage.
      log.debug(log.defaultContext(), 'Some dataACL\'s are present, on loading of this DataACL model');
      for (var i = 0; i < results.length; i++) {
        // No need to publish the message to other nodes, since other nodes will attach the hooks on their boot.
        // Attaching all models(DataACL.model) before save hooks when DataACL loads.
        // Passing directly model without checking existence since it is a mandatory field for DataACL.
        attachBeforeRemoteHookToModel(results[i].model, {ctx: results[i]._autoScope});
      }
      cb();
    } else {
      log.debug(log.defaultContext(), 'there are no dataACL\'s present');
      cb();
    }
  });
};

/**
 * This function is before save hook for DataACL model.
 *
 * @param {object} ctx - Model context
 * @param {function} next - callback function
 */
function dataACLBeforeSave(ctx, next) {
  log.debug(log.defaultContext(), 'In dataACLBeforeSave method.');
  var data = ctx.data || ctx.instance;
  // It is good to have if we have a declarative way of validating model existence.
  var modelName = data.model;
  if (loopback.findModel(modelName, ctx.options)) {
    log.debug(log.defaultContext(), 'Model ', modelName, ' exists. Continuing DataACL save.');
    next();
  } else {
    log.error(log.defaultContext(), 'Model ', modelName, ' doesnt exists. Sending error response.');
    // Not sure it is the right way to construct error object to sent in the response.
    var err = new Error('Model \'' + modelName + '\' doesn\'t exists.');
    next(err);
  }
}

/**
 * This function is after save hook for DataACL model.
 *
 * @param {object} ctx - Model context
 * @param {function} next - callback function
 */
function dataACLAfterSave(ctx, next) {
  log.debug(log.defaultContext(), 'dataACLAfterSave method.');
  var data = ctx.data || ctx.instance;
  // Publishing message to other nodes in cluster to attach the 'before save' hook for model.
  // messaging.publish('dataACLAttachHook', data.model, ctx.options);
  log.debug(log.defaultContext(), 'modelRuleAfterSave data is present. calling attachBeforeSaveHookToModel');
  attachBeforeRemoteHookToModel(data.model, ctx.options);
  next();
}

/**
 * This function is to attach before remote hook for given modelName to apply dataACL.
 *
 * @param {string} modelName - Model name
 * @param {Object} options - Context options
 */
function attachBeforeRemoteHookToModel(modelName, options) {
  var model = loopback.findModel(modelName, options);
  // Checking the flag that DataACL exists and attaching the hook
  if (!model.settings._dataACLExists) {
    model.settings._dataACLExists = true;
    // Attaching beforeRemote hook to model to do the DataACL applyFilter
    model.beforeRemote('**', function (ctx, modelInstance, next) {
      dataACLModel.applyFilter(ctx, next);
    });
  }
}
