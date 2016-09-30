'use strict';

let express = require('express');
let expressbuilder = require(process.cwd() + '/server/middlewares/express-builder');
let passport = require('passport');
let FacebookStrategy = require('passport-facebook').Strategy;


// Web Express App
// ---------------
function BuildWebApp(siteApp, routePath, viewPath) {

	let app = new expressbuilder(siteApp.locals.siteObj).getApp();

	//TODO: config drive this
	let passportConfig = {
		"clientID": '272914303107836',
		"clientSecret": "04d970e3e8aa0d0dda586a1f5c54a248",
		"profileFields": ['id', 'displayName', 'email']
	};

	app.use(passport.initialize());

	//TODO: move this to somewhere else
	passport.use(new FacebookStrategy(passportConfig, (accessToken, refreshToken, profile, done) => {
		let profileData = profile._json;
		profileData.facebookToken = accessToken;
		//First argument is error
		done(null, profileData);
	}));

	// Copy any locals
	app.locals = siteApp.locals;

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
