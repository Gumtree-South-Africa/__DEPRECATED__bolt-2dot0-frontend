"use strict";

var async = require("async");
var http = require("http");
var Q = require("q");

var config = require('config');

/** 
 * @description A service class that talks to Location BAPI
 * @constructor
 */
var LocationService = function() {};

//Gets a list of locations
LocationService.prototype.getLocationsData = function(depth) {
	console.log("Inside LocationService");
	console.log(config.get('BAPI.server.host'));
	
	var data = {
			x : { "id" : "201", name : "loc 1" },
			y : { "id" : "350", name : "loc 2" },
			z : { "id" : "466", name : "loc 3" }
		};
	return data;
	
	/**
	 * Use async and http to make BAPI call
	 */
}

module.exports = new LocationService();