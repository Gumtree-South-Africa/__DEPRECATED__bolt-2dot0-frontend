"use strict";

var http = require("http");
var Q = require("q");

var BasePageModel = require("./BasePageModel");

var locationService = require(process.cwd() + "/server/services/location");


/** 
 * @description A class that Handles the Location Model
 * @constructor
 */
var LocationModel = function (depth) {
    return new BasePageModel(this.getLocations(depth));
};


// Function getLocations
LocationModel.prototype.getLocations = function(depth) {
	var arrFunctions = [
		function (callback) {
			var locationDeferred,
				data = {};
			if (typeof callback !== "function") {
				return;
			}
			
		    if (typeof depth != "undefined") {
		    	locationDeferred = Q.defer();
				console.log("Calling LocationService");
			    
				 Q(locationService.getLocationsData(depth))
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

