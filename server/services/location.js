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

//Gets a list of locations
LocationService.prototype.getLocationsData = function(depth) {
	console.log("Inside LocationService");
	
	var data = {
			x : { "id" : "201", name : "loc 1" },
			y : { "id" : "350", name : "loc 2" },
			z : { "id" : "466", name : "loc 3" }
		};
	return data;
	
	/**
	 * Make BAPI call
	 */
	this.bapiOptions.path = config.get('BAPI.endpoints.locationHomePage');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters; 
	}
	var bapi = new BAPICall(this.bapiOptions);
	console.log("LocationService: About to call location BAPI");
	console.dir(bapi);
	
	var locationBapiDeferred = Q.defer();
	Q(bapi.prepareGet())
    	.then(function (data) {
    		console.log("LocationService: Return from location BAPI");
    		console.dir(data);
    		locationBapiDeferred.resolve(data);    		
		}).fail(function (err) {
			locationBapiDeferred.reject(new Error(err));
		});
	return locationBapiDeferred.promise;
}

module.exports = new LocationService();