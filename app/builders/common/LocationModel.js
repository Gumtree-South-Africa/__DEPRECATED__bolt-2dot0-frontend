'use strict';

let locationService = require(process.cwd() + '/server/services/location');
let Q = require("q");

/**
 * @description A class that Handles the Location Model
 * @constructor
 */
class LocationModel {
	constructor(bapiHeaders, depth) {
		this.bapiHeaders = bapiHeaders;
		this.depth = depth;
	}

	// Function getLocations
	getLocations() {
		if (typeof this.depth !== 'undefined') {
			return locationService.getLocationsData(this.bapiHeaders, this.depth);
		}
	}

	// Function getTopL2Locations
	getTopL2Locations() {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return locationService.getTopL2LocationsData(this.bapiHeaders);
		}
	}

	/**
	 * Returns results for use by client side ajax
	 * @param {lat/long} location - latitude and longitude for users location
	 * may return a rejected promise if no location was passed, avoid external call with bad payload
	 */
	getLocationLatLong(location, checkLeafLocations) {
		if (!location) {
			return Q.reject(new Error("getLocationLatLong expecting location parameter, rejecting promise"));
		}
		return locationService.getLatLongResults(this.bapiHeaders, location, checkLeafLocations);
	}
}

module.exports = LocationModel;
