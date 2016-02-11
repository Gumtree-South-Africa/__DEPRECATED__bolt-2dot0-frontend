"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to Config BAPI
 * @constructor
 */
var ConfigService = function() {
	// BAPI server options for GET
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets User Info given a token from the cookie
 */
ConfigService.prototype.getConfigData = function(locale) {
	console.log("Inside ConfigService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.configService');

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, null, locale, "config", null);
}

module.exports = new ConfigService();
