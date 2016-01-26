'use strict';

var Q = require("q");

var BAPICall = require("./BAPICall");

module.exports = function(bapiOptions, serviceName){
  	//Create Promise
	var bapiDeferred = Q.defer();

	// Instantiate BAPI and callback to resolve promise
	var bapi = new BAPICall(bapiOptions, null, function(arg, output) {
		console.log("LocationService: Callback from " + serviceName + " BAPI");
		if(typeof output === undefined) {
			bapiDeferred.reject(new Error("Error in calling " + serviceName + " BAPI"));
		} else {
			bapiDeferred.resolve(output);
		}
	});

	// Invoke BAPI request
	console.log("LocationService: About to call " + serviceName + " BAPI");
	bapi.doGet();

	// Return Promise Data
	return bapiDeferred.promise;
};
