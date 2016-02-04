"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to User BAPI
 * @constructor
 */
var UserService = function() {
	// BAPI server options for GET
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets User Info given a token from the cookie
 */
UserService.prototype.getUserFromCookie = function(requestId, cookie, locale) {
	console.log("Inside UserService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.userFromCookie');

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "user", cookie);
}

module.exports = new UserService();
