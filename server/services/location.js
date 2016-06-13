"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of locations
 */
LocationService.prototype.getLocationsData = function(bapiHeaders, depth) {
	// console.info("Inside LocationService");

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage') + "?depth=" + depth;

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, bapiHeaders, "location");
};

/**
 * Gets a list of top L2 locations
 */
LocationService.prototype.getTopL2LocationsData = function(bapiHeaders) {
	// console.info("Inside LocationService");

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.topLocationsL2');
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, bapiHeaders, "topL2Locations");
};

module.exports = new LocationService();
