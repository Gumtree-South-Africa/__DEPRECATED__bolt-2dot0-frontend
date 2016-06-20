'use strict';

var cuid = require('cuid');

module.exports = function() {
	return function(req, res, next) {
		// add requestId for bolt request tracking
		req.app.locals.requestId = cuid();

		// call next middleware
		next();
	};
};
