'use strict';

var ipware_getip = require('ipware')(process.cwd() + '/server/middlewares/check-ip-config.json').get_ip;

module.exports = function() {
	return function(req, res, next) {
		var result = ipware_getip(req);
		req.app.locals.ip = result.clientIp;

		// call next middleware
		next();
	};
};
