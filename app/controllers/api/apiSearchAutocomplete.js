'use strict';


var Q = require('q');

var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

router.get('/api/auto/model', function (req, res, next) {
	res.send('OK');
});
