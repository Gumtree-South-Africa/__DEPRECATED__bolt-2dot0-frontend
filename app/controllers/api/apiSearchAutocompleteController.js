'use strict';


var Q = require('q');

var express = require('express'),
  router = express.Router();

module.exports = function (app) {
  app.use('/', router);
};

/*
router.get('/api/autocomplete/model/:locale/:catId/:locId/:value', function (req, res) {
	res.send('OK');
});
*/