"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {
	// BAPI server options for GET
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of locations
 */
LocationService.prototype.getLocationsData = function(requestId, locale, depth) {
	// console.info("Inside LocationService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage') + "?depth=" + depth;

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "location", null);
};

/**
 * Gets a list of top L2 locations
 */
LocationService.prototype.getTopL2LocationsData = function(requestId, locale) {
	// console.info("Inside LocationService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.topLocationsL2');
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "topL2Locations", null);
};

module.exports = new LocationService();
