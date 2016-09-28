'use strict';

let _ = require('underscore');

module.exports = function() {
	return function(req, res, next) {
		let useragent = req.headers['user-agent'];

		if (typeof useragent !== 'undefined' && !_.isEmpty(useragent)) {
			req.app.locals.useragent = useragent;
		}

		// call next middleware
		next();
	};
};
