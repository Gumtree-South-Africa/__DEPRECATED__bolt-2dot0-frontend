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
    return new ModelBuilder(this.getLocations());
};


// Function getLocations
LocationModel.prototype.getLocations = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var locationDeferred,
				data = {};
			if (typeof callback !== "function") {
				return;
			}
			
		    if (typeof scope.depth !== "undefined") {
		    	locationDeferred = Q.defer();
				console.log("Calling LocationService");
			    
				 Q(locationService.getLocationsData(scope.locale, scope.depth))
			    	.then(function (dataReturned) {
			    		data = dataReturned;
			    		locationDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						locationDeferred.reject(new Error(err));
					    callback(null, data);
					});

				return locationDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];
	
	return arrFunctions;
};

module.exports = LocationModel;

