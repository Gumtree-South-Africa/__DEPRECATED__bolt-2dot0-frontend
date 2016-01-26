"use strict";

var Q = require("q");
var config = require('config');

var BAPICall = require("./lib/BAPICall");
var bapiOptions = require("./utils/bapiOptions")(config);

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
	this.bapiOptions.headers["X-BOLT-SITE-LOCALE"] = locale;

	// Create Promise
	var locationBapiDeferred = Q.defer();

	// Instantiate BAPI and callback to resolve promise
	var bapi = new BAPICall(this.bapiOptions, null, function(arg, output) {
		console.log("LocationService: Callback from location BAPI");
		if(typeof output === undefined) {
			locationBapiDeferred.reject(new Error("Error in calling location BAPI"));
		} else {
			locationBapiDeferred.resolve(output);
		}
	});

	// Invoke BAPI request
	console.log("LocationService: About to call location BAPI");
	bapi.doGet();

	// Return Promise Data
	return locationBapiDeferred.promise;
}

module.exports = new LocationService();
