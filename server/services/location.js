"use strict";

var Q = require("q");

var config = require('config');

/** 
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {
	// BAPI server options for GET
	this.bapiOptions = {
   		host : config.get('BAPI.server.host'),
    	port : config.get('BAPI.server.port'),
    	path : "/",
    	method : "GET"
	};
};

//Gets a list of locations
LocationService.prototype.getLocationsData = function(depth) {
	console.log("Inside LocationService");
	console.log(config.get('BAPI.server.host'));
	console.log(this.bapiOptions);
	
	var data = {
			x : { "id" : "201", name : "loc 1" },
			y : { "id" : "350", name : "loc 2" },
			z : { "id" : "466", name : "loc 3" }
		};
	return data;
	
	/**
	 * Make BAPI call
	 */
	var D = new BAPICall(self.bapiOptions, arg1, callback);
	var locationBapi = Q.defer();
	Q(D.prepareGet())
    	.then(function (data) {
    		console.log("inside location service");
    		console.dir(data);
    		locationBapi.resolve(data);    		
		}).fail(function (err) {
			locationBapi.reject(new Error(err));
		});
	return locationBapi.promise;
}

module.exports = new LocationService();