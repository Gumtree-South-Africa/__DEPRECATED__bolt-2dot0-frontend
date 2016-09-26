'use strict';

let ipwareGetip = require('ipware')(process.cwd() + '/server/middlewares/check-ip-config.json').get_ip;

module.exports = function() {
	return function(req, res, next) {
		let result = ipwareGetip(req);
		req.app.locals.ip = result.clientIp;

		// call next middleware
		next();
	};
};
