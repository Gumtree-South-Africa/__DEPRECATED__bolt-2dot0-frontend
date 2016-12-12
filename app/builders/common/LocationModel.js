'use strict';

let locationService = require(process.cwd() + '/server/services/location');
let iplocation = require('iplocation');
let network = require('network');

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

	/**
	 * Returns location by Ip address
	 *
	 * may return a rejected promise if no ip was passed, avoid external call with bad payload
	 */
	 getLocationLatLongByIpAddress() {
			return new Promise(function(resolve, reject) {
				network.get_public_ip(function(err, ip) {
		      if (err) {
						reject(err);
					} else {
						iplocation(ip, function(error, res) {
		 					if (error) {
								reject(error);
							} else {
								resolve(res);
							}
	 					});
					}
	    	});
			});
		}
}

module.exports = LocationModel;
