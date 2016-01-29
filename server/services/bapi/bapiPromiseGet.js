'use strict';

var Q = require("q");

var BAPICall = require("./BAPICall");

module.exports = function(bapiOptions, locale, serviceName, authTokenValue){
	bapiOptions.headers["X-BOLT-SITE-LOCALE"] = locale;
	if (typeof authTokenValue !== "undefined" && authTokenValue!=null) {
		bapiOptions.headers["Authorization"] = "Bearer " +  authTokenValue;
	}
	
	console.log("****************************Bapioptions" + serviceName);
	console.dir(bapiOptions.headers);
	
  	//Create Promise
	var bapiDeferred = Q.defer();

	// Instantiate BAPI and callback to resolve promise
	var bapi = new BAPICall(bapiOptions, null, function(arg, output) {
		console.log(serviceName + "Service: Callback from " + serviceName + " BAPI");
		if(typeof output === undefined) {
			bapiDeferred.reject(new Error("Error in calling " + serviceName + " BAPI"));
		} else {
			bapiDeferred.resolve(output);
		}
	});

	// Invoke BAPI request
	console.log(serviceName + "Service: About to call " + serviceName + " BAPI");
	bapi.doGet();

	// Return Promise Data
	return bapiDeferred.promise;
};
