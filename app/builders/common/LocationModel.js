"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var locationService = require(process.cwd() + "/server/services/location");


/** 
 * @description A class that Handles the Location Model
 * @constructor
 */
var LocationModel = function (locale, depth) {
	this.locale = locale;
	this.depth = depth;
};


// Function getLocations
LocationModel.prototype.getLocations = function() {
	var scope = this;
	var locationDeferred = Q.defer();
	var data = {};
	
    if (typeof scope.depth !== "undefined") {
		console.log("Calling LocationService");
	    
		 Q(locationService.getLocationsData(scope.locale, scope.depth))
	    	.then(function (dataReturned) {
	    		data = dataReturned;
	    		locationDeferred.resolve(data);
			}).fail(function (err) {
				locationDeferred.reject(new Error(err));
			});
	} 

    return locationDeferred.promise;
};

//Function getTopL2Locations
LocationModel.prototype.getTopL2Locations = function() {
	var scope = this;
	var locationDeferred = Q.defer();
	var data = {};
	
    if (typeof scope.locale !== "undefined") {
		console.log("Calling LocationService");
	    
		 Q(locationService.getTopL2LocationsData(scope.locale))
	    	.then(function (dataReturned) {
	    		data = dataReturned;
	    		locationDeferred.resolve(data);
			}).fail(function (err) {
				locationDeferred.reject(new Error(err));
			});
	} 

    return locationDeferred.promise;
};

module.exports = LocationModel;

