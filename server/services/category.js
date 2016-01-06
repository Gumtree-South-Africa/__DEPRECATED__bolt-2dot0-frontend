"use strict";

var Q = require("q");
var config = require('config');

var BAPICall = require("./lib/BAPICall");

/** 
 * @description A service class that talks to Category BAPI
 * @constructor
 */
var CategoryService = function() {
	// BAPI server options for GET
	this.bapiOptions = {
   		host : config.get('BAPI.server.host'),
    	port : config.get('BAPI.server.port'),
    	parameters : config.get('BAPI.server.parameters'),
    	path : "/",
    	method : "GET"
	};
};

//Gets a list of categories for the homepage
CategoryService.prototype.getCategoriesData = function(depth) {
	console.log("Inside CategoryService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters; 
	}
	
	// Create Promise
	var categoryBapiDeferred = Q.defer();
	
	// Instantiate BAPI and callback to resolve promise
	var bapi = new BAPICall(this.bapiOptions, null, function(arg, output) {
		console.log("CategoryService: Callback from category BAPI");
		if(typeof output === undefined) {
			categoryBapiDeferred.reject(new Error("Error in calling category BAPI"));
		} else {
			categoryBapiDeferred.resolve(output);
		}
	});
	
	// Invoke BAPI request
	console.log("CategoryService: About to call category BAPI");
	bapi.doGet();
	
	// Return Promise Data
	return categoryBapiDeferred.promise;
}

module.exports = new CategoryService();