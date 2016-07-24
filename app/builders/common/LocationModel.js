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

//Function getTopL2Locations

	getTopL2Locations() {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return locationService.getTopL2LocationsData(this.bapiHeaders);
		}
	}
}
module.exports = LocationModel;

