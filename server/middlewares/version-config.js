'use strict';


module.exports = function() {

	function checkCookie(req, res) {
		res.locals.b2dot0Version = req.cookies.b2dot0Version === '2.0';
	}

	function checkUrlParam(req, res) {
		switch (req.query.v) {
			case '2c2832fd':
			case '154c0359':
			case '0adbd7c9':
			case '0031e3f6':
			case '1659313c':
				res.cookie('b2dot0Version', '1.0', {'httpOnly': true});
				res.locals.b2dot0Version = false;
				break;
			case '10122d18':
			case '0d81ed6b':
			case '23f427a7':
			case '34a285b4':
			case '1b3a71ee':
				res.cookie('b2dot0Version', '2.0', {'httpOnly': true});
				res.locals.b2dot0Version = true;
				break;
			default: // Step 3: Check the Cookie
				checkCookie(req, res);
		}
	}

	return function(req, res, next) {
		// Step 0: Default b2dot0Version to v1
		res.locals.b2dot0Version = false;

		// Step 1: Check the ENV variable
		let pageVersion = process.env.PAGE_VER || 'v1';
		if (pageVersion === 'v2') {
			res.locals.b2dot0Version = true;
		} else {
			// Step 2: Check the URL parameter
			if ((typeof req.query.v === 'undefined') || (req.query.v === null) || (req.query.v === '')) {
				checkCookie(req, res);
			} else {
				checkUrlParam(req, res);
			}
		}

		// call next middleware
		next();
	};

};
