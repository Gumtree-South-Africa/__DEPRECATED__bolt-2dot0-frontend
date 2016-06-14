"use strict";

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Config BAPI
 * @constructor
 */
var ConfigService = function() {
};

/**
 * Gets User Info given a token from the cookie
 */
ConfigService.prototype.getConfigData = function(bapiHeaderValues) {
	// console.info("Inside ConfigService", bapiHeaders);
	
	// Note the Locale is coming in the bapiHeaderValues

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.configService')
	}), bapiHeaderValues, "config");
}

module.exports = new ConfigService();
