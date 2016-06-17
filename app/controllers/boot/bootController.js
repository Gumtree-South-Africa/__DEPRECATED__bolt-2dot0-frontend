'use strict';

var express = require('express'), router = express.Router();

module.exports = function(app) {
	app.use('/', router);
};

router.get('/boot/status', function(req, res, next) {
	res.send('OK');
});
