'use strict';

var Q = require('q');

var BAPICall = require('./BAPICall');

module.exports = function(bapiOptions, requestId, locale, serviceName, authTokenValue, postData){
	console.time('Instrument-BAPI-' + serviceName);

	// Add Headers
	bapiOptions.headers['Content-Type'] = 'application/json';
	bapiOptions.headers['X-BOLT-APPS-ID'] = 'RUI';
	bapiOptions.headers['X-BOLT-SITE-LOCALE'] = locale;
	if (typeof requestId !== 'undefined' && requestId!=null) {
		bapiOptions.headers['X-BOLT-TRACE-ID'] = requestId;
	}
	if (typeof authTokenValue !== 'undefined' && authTokenValue!=null) {
		bapiOptions.headers['Authorization'] = 'Bearer ' +  authTokenValue;
	}
	
	// Add extra parameters
	if (bapiOptions.parameters != undefined) {
		if ( bapiOptions.path.indexOf('?') > -1 ) {
			bapiOptions.path = bapiOptions.path + '&' + bapiOptions.parameters;
		} else {
			bapiOptions.path = bapiOptions.path + '?' + bapiOptions.parameters;
		}
	} 

  	//Create Promise
	var bapiDeferred = Q.defer();

	// Instantiate BAPI and callback to resolve promise
	var bapi = new BAPICall(bapiOptions, null, function(arg, output) {
		// console.info(serviceName + 'Service: Callback from ' + serviceName + ' BAPI');
		if(typeof output === undefined || output.statusCode) {
			var bapiError = {};
			bapiError.status = output.statusCode;
			bapiError.message = output.message;
			bapiError.details = output.details;
			bapiError.serviceName = serviceName;
			bapiDeferred.reject(bapiError);
		} else {
			bapiDeferred.resolve(output);
			console.timeEnd('Instrument-BAPI-' + serviceName);
		}
	});

	console.log('###################', bapiOptions);
	console.log('###################', postData);

	// Invoke BAPI request
	// console.info(serviceName + 'Service: About to call ' + serviceName + ' BAPI');
	bapi.doPost(postData);

	// Return Promise Data
	return bapiDeferred.promise;
};
