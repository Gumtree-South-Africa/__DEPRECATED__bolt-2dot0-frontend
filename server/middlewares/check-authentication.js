'use strict';


let Q = require('q');
let _ = require('underscore');
let pageurlJson = require(process.cwd() + '/app/config/pageurl.json');

let userService = require(process.cwd() + '/server/services/user');

function redirectLogin(res) {
	let loginLink = pageurlJson.header.signInURL;
	res.redirect(loginLink);
}

module.exports = function(locale) {
	return function(req, res, next) {
		let nonSecurePaths = ['/', '/api'];

		// If it is a non secure path, let the request through
		if (_.contains(nonSecurePaths, req.path)) {
			return next();
        }

		// Check if User has logged in already, else redirect to login page
		let authCookieName = 'bt_auth';
		let authenticationCookie = req.cookies[authCookieName];
		if (typeof authenticationCookie === 'undefined') {
			redirectLogin(res);
		} else {
			let bapiHeaders = {
				'requestId': req.app.locals.requestId,
				'ip': req.app.locals.ip,
				'machineid': req.app.locals.machineid,
				'useragent': req.app.locals.useragent,
				'locale': locale,
				'authTokenValue': authenticationCookie
			};

			Q(userService.getUserFromCookie(bapiHeaders))
				.then(function(dataReturned) {
					if (_.isEmpty(dataReturned)) {
						redirectLogin(res);
					} else {
						req.app.locals.userCookieData = dataReturned;

						next();
					}
				}).fail(function(err) {
				console.error('check-authentication failed as bapi failed with provided cookie', new Error(err));
				redirectLogin(res);
			});
		}
	};
};
