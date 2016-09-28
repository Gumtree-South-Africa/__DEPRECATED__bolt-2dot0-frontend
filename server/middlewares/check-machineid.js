'use strict';

let _ = require('underscore');
let uuid = require('node-uuid');


module.exports = function() {
	return function(req, res, next) {
		// Get from cookie. If cookie not there, create one.
		let machguidCookieName = 'machguid';
		let machguidCookie = req.cookies[machguidCookieName];
		if (typeof machguidCookie === 'undefined' || (typeof machguidCookie !== 'undefined' && _.isEmpty(machguidCookie))) {
			// TODO: check with 1.0 code on how they decrypt machguid
			let now = new Date();
			machguidCookie = uuid.v4() + '-' + now.getTime().toString(16);

			// Set back in cookie
			res.clearCookie(machguidCookieName);
			res.cookie(machguidCookieName, machguidCookie, {maxAge: 1000 * 60 * 60 * 24 * 365, httpOnly: true});
		}

		// Set in request context
		req.app.locals.machineid = machguidCookie;

		// call next middleware
		next();
	};
};
