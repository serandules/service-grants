var log = require('logger')('service-grants');
var bodyParser = require('body-parser');

var auth = require('auth');
var throttle = require('throttle');
var serandi = require('serandi');
var model = require('model');
var errors = require('errors');
var mongutils = require('mongutils');
var Grants = require('model-grants');
var validators = require('./validators');

module.exports = function (router, done) {
  router.use(serandi.ctx);
  router.use(serandi.many);
  router.use(auth());
  router.use(throttle.apis('grants'));
  router.use(bodyParser.json());

  router.post('/',
    serandi.json,
    validators.create,
    function (req, res, next) {
      model.create(req.ctx, function (err, client) {
        if (err) {
          if (err.code === mongutils.errors.DuplicateKey) {
            return next(errors.conflict());
          }
          return next(err);
        }
        res.locate(client.id).status(201).send(client);
      });
    });

  router.post('/:id',
    serandi.id,
    serandi.json,
    serandi.transit({
      workflow: 'model',
      model: Grants
    }));

  router.get('/:id',
    serandi.id,
    serandi.findOne(Grants),
    function (req, res, next) {
      model.findOne(req.ctx, function (err, client) {
        if (err) {
          return next(err);
        }
        res.send(client);
      });
    });

  router.put('/:id',
    serandi.id,
    serandi.json,
    serandi.update(Grants),
    function (req, res, next) {
      model.update(req.ctx, function (err, client) {
        if (err) {
          return next(err);
        }
        res.locate(client.id).status(200).send(client);
      });
    });

  router.get('/',
    serandi.find(Grants),
    function (req, res, next) {
      model.find(req.ctx, function (err, grants, paging) {
        if (err) {
          return next(err);
        }
        res.many(grants, paging);
      });
    });

  router.delete('/:id',
    serandi.id,
    serandi.remove(Grants),
    function (req, res, next) {
      model.remove(req.ctx, function (err) {
        if (err) {
          return next(err);
        }
        res.status(204).end();
      });
    });

  done();
};
