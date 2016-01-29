'use strict';

var Q = require("q");

var BAPICall = require("./BAPICall");

module.exports = function(bapiOptions, locale, serviceName, authTokenValue){
	// Add Headers
	bapiOptions.headers["X-BOLT-SITE-LOCALE"] = locale;
	if (typeof authTokenValue !== "undefined" && authTokenValue!=null) {
		bapiOptions.headers["Authorization"] = "Bearer " +  authTokenValue;
	}
	
	// Add extra parameters
	console.dir(bapiOptions);
	if (bapiOptions.parameters != undefined) {
		if ( bapiOptions.path.indexOf("?") > -1 ) {
			bapiOptions.path = bapiOptions.path + "&" + bapiOptions.parameters;
		} else {
			bapiOptions.path = bapiOptions.path + "?" + bapiOptions.parameters;
		}
	} 
	
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
