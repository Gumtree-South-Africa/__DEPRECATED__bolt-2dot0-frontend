'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptions')(config);
var Q = require('q');

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
	// console.info('Inside LocationService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage') + '?depth=' + depth;

	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'location:depth'+depth);
};

/**
 * Gets a list of top L2 locations
 */
LocationService.prototype.getTopL2LocationsData = function(bapiHeaders) {
	// console.info('Inside LocationService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.topLocationsL2');

	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'topL2Locations');
};

/**
 * Gets a list of locations from Lat/Lng
 */
LocationService.prototype.getLatLongResults = function (bapiHeaders, geoLatLngObj, checkLeafLocations) {
	// because the code leading up to the promise could fail, wrap it in fcall so the caller will see a failed promise
	return Q.fcall(() => {
		if (!geoLatLngObj) {
			return Q.reject(new Error('getLatLongResults expecting location parameter, rejecting promise'));
		}
		if (!geoLatLngObj.lat || !geoLatLngObj.lng) {
			return Q.reject(new Error(`getLatLongResults expecting lat/long, got: ${geoLatLngObj.lat}, ${geoLatLngObj.lng}, rejecting promise`));
		}

		this.bapiOptions.methods = 'GET';
		this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage') + '/' + geoLatLngObj.lat + '/' + geoLatLngObj.lng + '?isLeaf=' + checkLeafLocations;

		return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'locationLatLong');
	});
}


module.exports = new LocationService();
