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
	
	var data = {
			a : { "id" : "1204", name : "cat 1" },
			b : { "id" : "1510", name : "cat 2" },
			c : { "id" : "1846", name : "cat 3" }
		};
	return data;
	
	/**
	 * Make BAPI call
	 */
	this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters; 
	}
	var bapi = new BAPICall(this.bapiOptions);
	console.log("CategoryService: About to call category BAPI");
	console.dir(bapi);
	
	var categoryBapiDeferred = Q.defer();
	Q(bapi.prepareGet())
    	.then(function (data) {
    		console.log("CategoryService: Return from category BAPI");
    		console.dir(data);
    		categoryBapiDeferred.resolve(data);    		
		}).fail(function (err) {
			categoryBapiDeferred.reject(new Error(err));
		});
	return categoryBapiDeferred.promise;
}

module.exports = new CategoryService();