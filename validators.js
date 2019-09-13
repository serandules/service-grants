var _ = require('lodash');
var utils = require('utils');
var serandi = require('serandi');
var errors = require('errors');
var Grants = require('model-grants');
var Clients = require('model-clients');
var validators = require('validators');
var model = validators.model;

exports.create = function (req, res, next) {
  serandi.create(Grants)(req, res, function (err) {
    if (err) {
      return next(err);
    }
    var data = req.body;
    var location = data.location;
    if (!location) {
      return next(errors.unprocessableEntity('\'location\' needs to be specified'));
    }
    var origin = utils.origin(location);
    if (!origin) {
      return next(next(errors.unprocessableEntity('\'location\' contains an invalid value')));
    }
    Clients.findOne({_id: data.client}).select('to').exec(function (err, client) {
      if (err) {
        return next(err);
      }
      if (!client) {
        return next(errors.unauthorized());
      }
      var to = client.to;
      if (!to || !to.length) {
        return next(errors.unauthorized());
      }
      var loc = _.find(to, function (loc) {
        return loc.indexOf(origin) === 0;
      });
      if (!loc) {
        return next(errors.unauthorized());
      }
      next();
    });
  });
};
