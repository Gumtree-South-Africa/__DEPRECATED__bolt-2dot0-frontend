'use strict';

let express = require('express');
let expressbuilder = require(process.cwd() + '/server/middlewares/express-builder');


// Web Express App
// ---------------
function BuildPostApp(siteApp, routePath, viewPath) {

	let app = new expressbuilder(siteApp.locals.siteObj).getApp();

	// Copy any locals
	app.locals = siteApp.locals;

	// Configure routes
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
module.exports = BuildPostApp;
