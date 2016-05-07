'use strict';


var http = require('http'),
	Q = require('q');

var locationService = require(process.cwd() + '/server/services/location');


/** 
 * @description A class that Handles the Location Model
 * @constructor
 */
var LocationModel = function (bapiHeaders, depth) {
	this.bapiHeaders = bapiHeaders;
	this.depth = depth;
};

// Function getLocations
LocationModel.prototype.getLocations = function() {
	var scope = this;
	var locationDeferred = Q.defer();
	var data = {};
	
    if (typeof scope.depth !== 'undefined') {
		 Q(locationService.getLocationsData(scope.bapiHeaders, scope.depth))
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

	if (typeof scope.bapiHeaders.locale !== 'undefined') {
		 Q(locationService.getTopL2LocationsData(scope.bapiHeaders))
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

