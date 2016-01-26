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
LocationService.prototype.getLocationsData = function(locale, depth) {
	console.log("Inside LocationService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters + "&depth=2";
	} else {
		this.bapiOptions.path = this.bapiOptions.path + "?depth=2";
	}
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, locale, "location");
}

module.exports = new LocationService();
