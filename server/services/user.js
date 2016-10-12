"use strict";

var config = require('config');

var Q = require('q');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to User BAPI
 * @constructor
 */
var UserService = function() {
	this.bapiOptions = bapiOptions;
};

/**
 * Gets User Info given a token from the cookie
 */
UserService.prototype.getUserFromCookie = function(bapiHeaders) {
	// console.info("Inside UserService");

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.userFromCookie');

	// Invoke BAPI
	return require("./bapi/bapiService").bapiPromiseGet(this.bapiOptions, bapiHeaders, "user");
};

module.exports = new UserService();
