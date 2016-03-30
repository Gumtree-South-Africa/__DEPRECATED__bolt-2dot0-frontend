'use strict';

var Q = require("q");

var BAPICall = require("./BAPICall");

module.exports = function(bapiOptions, requestId, locale, serviceName, authTokenValue){
	console.time('Instrument-BAPI-' + serviceName);

	// Add Headers
	bapiOptions.headers["X-BOLT-APPS-ID"] = "RUI";
	bapiOptions.headers["X-BOLT-SITE-LOCALE"] = locale;
	if (typeof requestId !== "undefined" && requestId!=null) {
		bapiOptions.headers["X-BOLT-TRACE-ID"] = requestId;
	}
	if (typeof authTokenValue !== "undefined" && authTokenValue!=null) {
		bapiOptions.headers["Authorization"] = "Bearer " +  authTokenValue;
	}
	
	// Add extra parameters
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
		// console.info(serviceName + "Service: Callback from " + serviceName + " BAPI");
		if(typeof output === undefined || output.statusCode) {
			bapiDeferred.reject(serviceName + " BAPI returned: " + output.statusCode + " , details: " + output);
		} else {
			bapiDeferred.resolve(output);
			console.timeEnd('Instrument-BAPI-' + serviceName);
		}
	});

	// Invoke BAPI request
	// console.info(serviceName + "Service: About to call " + serviceName + " BAPI");
	bapi.doGet();

	// Return Promise Data
	return bapiDeferred.promise;
};
