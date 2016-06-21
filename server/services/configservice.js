"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to Config BAPI
 * @constructor
 */
var ConfigService = function() {
	this.bapiOptions = bapiOptions;
};

/**
 * Gets User Info given a token from the cookie
 */
ConfigService.prototype.getConfigData = function(bapiHeaders) {
	// console.info("Inside ConfigService", bapiHeaders);

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.configService');

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, bapiHeaders, "config");
}

module.exports = new ConfigService();
