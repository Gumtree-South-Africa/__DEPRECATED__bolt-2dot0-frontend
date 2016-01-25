"use strict";

var Q = require("q");
var config = require('config');

var BAPICall = require("./lib/BAPICall");

/** 
 * @description A service class that talks to User BAPI
 * @constructor
 */
var UserService = function() {
	// BAPI server options for GET
	this.bapiOptions = {
   		host : config.get('BAPI.server.host'),
    	port : config.get('BAPI.server.port'),
    	parameters : config.get('BAPI.server.parameters'),
    	path : "/",
    	method : "GET",
    	headers: {
    		"X-BOLT-APPS-ID": "RUI"
    	}
	};
};

/**
 * Gets User Info given a token from the cookie
 */
UserService.prototype.getUserFromCookie = function(cookie, locale) {
	console.log("Inside UserService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.userFromCookie');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "/" + cookie + "?" + this.bapiOptions.parameters; 
	}
	this.bapiOptions.headers["X-BOLT-SITE-LOCALE"] = locale;
	
	// Create Promise
	var userBapiDeferred = Q.defer();
	
	// Instantiate BAPI and callback to resolve promise
	var bapi = new BAPICall(this.bapiOptions, null, function(arg, output) {
		console.log("UserService: Callback from User BAPI");
		if(typeof output === undefined) {
			userBapiDeferred.reject(new Error("Error in calling User BAPI"));
		} else {
			userBapiDeferred.resolve(output);
		}
	});
	
	// Invoke BAPI request
	console.log("UserService: About to call User BAPI");
	bapi.doGet();
	
	// Return Promise Data
	return userBapiDeferred.promise;
}

module.exports = new UserService();