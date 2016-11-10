'use strict';

let abtestpagesJson = require(process.cwd() + '/app/config/abtestpages.json');


module.exports = function(locale) {

	function checkCookie(req, res) {
		res.locals.b2dot0Version = req.cookies.b2dot0Version === '2.0';
	}

	//
	//URL for version 1.0
	//	?v=2c2832fd
	//	?v=154c0359
	//	?v=0adbd7c9
	//	?v=0031e3f6
	//	?v=1659313c
	//
	//URL for version 2.0
	//	?v=10122d18
	//	?v=0d81ed6b
	//	?v=23f427a7
	//	?v=34a285b4
	//	?v=1b3a71ee
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
		// b2dot0Pages
		if (locale === 'es_MX') {
			// Set which pages have to be in 2.0
			let pages = [];
			pages.push(abtestpagesJson.pages.H);
			pages.push(abtestpagesJson.pages.N);
			pages.push(abtestpagesJson.pages.ER);
			res.locals.b2dot0Pages = pages;
		}

		// b2dot0Version
		if(locale==='en_IE' || locale==='pl_PL' || locale==='es_AR') {
			// ALWAYS enable 1.0
			res.locals.b2dot0Version = false;
			res.cookie('b2dot0Version', '1.0', {'httpOnly': true});
		} else {
			// ALLOW the cookie/v parameter to decide
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
		}

		// b2dot0PageVersion
		res.locals.b2dot0PageVersion = res.locals.b2dot0Version;

		// call next middleware
		next();
	};

};
