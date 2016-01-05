"use strict";

var Q = require("q");
var config = require('config');

var BAPICall = require("./lib/BAPICall");

/** 
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {
	// BAPI server options for GET
	this.bapiOptions = {
   		host : config.get('BAPI.server.host'),
    	port : config.get('BAPI.server.port'),
    	parameters : config.get('BAPI.server.parameters'),
    	path : "/",
    	method : "GET"
	};
};

/**
 * Gets a list of locations
 */
LocationService.prototype.getLocationsData = function(depth) {
	console.log("Inside LocationService");
	
	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters; 
	}
	
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