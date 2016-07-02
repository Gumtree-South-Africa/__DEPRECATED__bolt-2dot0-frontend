'use strict';

let express = require('express');
let expressbuilder = require(process.cwd() + '/server/middlewares/express-builder');


// Web Express App
// ---------------
function BuildWebApp(siteApp) {

	let app = new expressbuilder(siteApp.locals.siteObj).getApp();

	// Copy any locals
	app.locals = siteApp.locals;

	// Configure controllers
	app.use('/', require('./controllers'));

	// Configure views
	if (app.locals.devMode === true) {
		app.use('/views', express.static('./views', {
			root: '/views', etag: false, maxage: 0, index: false
		}));
	}

	this.getApp = function() {
		return app;
	};
}


// Exports
// -------
module.exports = BuildWebApp;
