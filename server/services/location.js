"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);
var Q = require("q");

/**
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {
	this.bapiOptions = bapiOptions;
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

/**
 * Gets a list of locations from Lat/Lng
 */
LocationService.prototype.getLatLongResults = function (bapiHeaders, geoId) {
	// because the code leading up to the promise could fail, wrap it in fcall so the caller will see a failed promise
	return Q.fcall(() => {
		if (!geoId) {
			return Q.reject(`expected string format <lat>ng<long>, got: '${geoId}', rejecting promise`);
		}
		var geoIdSplit = geoId.split('ng');
		if (geoIdSplit.length !== 2) {
			return Q.reject(`expected string format <lat>ng<long>, got: '${geoId}', rejecting promise`);
		}
		var geoLat = geoIdSplit[0];
		var geoLng = geoIdSplit[1];

		this.bapiOptions.methods = 'GET';
		this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage') + '/' + geoLat + '/' + geoLng;

		return require("./bapi/bapiPromiseGet")(this.bapiOptions, bapiHeaders);
	});
}


module.exports = new LocationService();
