'use strict';

let express = require('express');
let expressbuilder = require(process.cwd() + '/server/middlewares/express-builder');


// Web Express App
// ---------------
function BuildWebApp(siteApp, routePath, viewPath) {

	let app = new expressbuilder(siteApp.locals.siteObj).getApp();

	// Copy any locals
	app.locals = siteApp.locals;

	app.use((req, res, next) => {
		let pageVersion = process.env.PAGE_VER || 'v1';

		res.locals.b2dot0Version = false;
		if (pageVersion === 'v2') {
			res.locals.b2dot0Version = true;
		} else {
			res.locals.b2dot0Version = req.cookies.b2dot0Version === '2.0';
		}
		next();
	});

	// Configure controllers
	app.use('/', require(routePath));

	// Configure views
	if (app.locals.devMode === true) {
		// for dev purpose lets make all static none cacheable
		// http://evanhahn.com/express-dot-static-deep-dive/
		app.use('/views', express.static(viewPath, {
			root: '/views', etag: false, maxage: 0, index: false
		}));
	}

	this.getApp = () => {
		return app;
	};
}


// Exports
// -------
module.exports = BuildWebApp;
