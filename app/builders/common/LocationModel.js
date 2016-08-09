'use strict';

let locationService = require(process.cwd() + '/server/services/location');


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
	 */
	getLocationLatLong(location) {
		if (typeof location !== 'undefined') {
			return locationService.getLatLongResults(this.bapiHeaders, location);
		}
	}
}

module.exports = LocationModel;
