"use strict";

var Q = require("q");

var config = require('config');

/** 
 * @description A service class that talks to Category BAPI
 * @constructor
 */
var CategoryService = function() {
	// BAPI server options for GET
	this.bapiOptions = {
   		host : config.get('BAPI.server.host'),
    	port : config.get('BAPI.server.port'),
    	path : "/",
    	method : "GET"
	};
};

//Gets a list of categories for the homepage
CategoryService.prototype.getCategoriesData = function(depth) {
	console.log("Inside CategoryService");
	console.log(config.get('BAPI.server.host'));
	console.log(this.bapiOptions);
	
	var data = {
			a : { "id" : "1204", name : "cat 1" },
			b : { "id" : "1510", name : "cat 2" },
			c : { "id" : "1846", name : "cat 3" }
		};
	return data;
	
	/**
	 * Make BAPI call
	 */
	this.bapiOptions.path = "/categories/";
	var bapi = new BAPICall(this.bapiOptions, arg1, callback);
	var categoryBapiDeferred = Q.defer();
	Q(bapi.prepareGet())
    	.then(function (data) {
    		console.log("inside category service");
    		console.dir(data);
    		categoryBapiDeferred.resolve(data);    		
		}).fail(function (err) {
			categoryBapiDeferred.reject(new Error(err));
		});
	return categoryBapiDeferred.promise;
}

module.exports = new CategoryService();