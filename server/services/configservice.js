"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptionsModel")(config);
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Config BAPI
 * @constructor
 */
var ConfigService = function() {
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets User Info given a token from the cookie
 */
ConfigService.prototype.getConfigData = function(bapiHeaderValues) {
	// console.info("Inside ConfigService", bapiHeaders);

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.configService');
    // Note the Locale is coming in the bapiHeaderValues

	// Invoke BAPI
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaderValues, "config");
}

module.exports = new ConfigService();
