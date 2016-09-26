'use strict';

let ipwareGetip = require('ipware')(process.cwd() + '/server/middlewares/check-ip-config.json');

module.exports = function() {
	return function(req, res, next) {
		let result = ipwareGetip.get_ip(req, false);

		let ip = result.clientIp;
		if (ip.substr(0, 7) === '::ffff:') {
			ip = ip.substr(7);
		}

		req.app.locals.ip = ip;

		// call next middleware
		next();
	};
};
