'use strict';

var _ = require('underscore');
var Q = require('q');

var bapi = require('./BAPICall');

var makeHeaders = function (bapiHeaderValues) {
	// Add Headers
	var headers = {};
	headers['X-BOLT-APPS-ID'] = 'RUI';
	if (typeof bapiHeaderValues.locale !== 'undefined' && !_.isEmpty(bapiHeaderValues.locale)) {
		headers['X-BOLT-SITE-LOCALE'] = bapiHeaderValues.locale;
	}
	if (typeof bapiHeaderValues.requestId !== 'undefined' && !_.isEmpty(bapiHeaderValues.requestId)) {
		headers['X-BOLT-TRACE-ID'] = bapiHeaderValues.requestId;
	}
	if (typeof bapiHeaderValues.ip !== 'undefined' && !_.isEmpty(bapiHeaderValues.ip)) {
		headers['X-BOLT-IP-ADDRESS'] = bapiHeaderValues.ip;
	}
	if (typeof bapiHeaderValues.machineid !== 'undefined' && !_.isEmpty(bapiHeaderValues.machineid)) {
		headers['X-BOLT-MACHINE-ID'] = bapiHeaderValues.machineid;
	}
	if (typeof bapiHeaderValues.useragent !== 'undefined' && !_.isEmpty(bapiHeaderValues.useragent)) {
		headers['X-BOLT-USER-AGENT'] = bapiHeaderValues.useragent;
	}
	if (typeof bapiHeaderValues.authTokenValue !== 'undefined' && !_.isEmpty(bapiHeaderValues.authTokenValue)) {
		headers['Authorization'] = 'Bearer ' +  bapiHeaderValues.authTokenValue;
	}
	return headers;
};

var augmentPathWithParams = function(path, parameters) {
	var newPath = path;
	if (parameters != undefined) {
		if ( path.indexOf('?') > -1 ) {
			newPath = path + '&' + parameters;
		} else {
			newPath = path + '?' + parameters;
		}
	}
	return newPath;
}

var bapiPromiseGet = function(bapiOptions, bapiHeaderValues, serviceName){
	console.time('Instrument-BAPI-' + serviceName);

	bapiOptions.headers = makeHeaders(bapiHeaderValues);
	bapiOptions.path = augmentPathWithParams(bapiOptions.path, bapiOptions.parameters);

	// Invoke BAPI request
	// console.info(serviceName + 'Service: About to call ' + serviceName + ' BAPI');
	return bapi.doGet(bapiOptions, null).then((output) => {
		// console.info(serviceName + 'Service: Callback from ' + serviceName + ' BAPI');
		if(typeof output === undefined || output.statusCode) {
			var bapiError = {};
			bapiError.status = output.statusCode;
			bapiError.message = output.message;
			bapiError.details = output.details;
			bapiError.serviceName = serviceName;
			return Q.reject(bapiError);
		} else {
			console.timeEnd(`Instrument-BAPI-${serviceName} ${bapiHeaders.locale}`);
			return output;
		}
	});
};



var bapiPromisePost = function(bapiOptions, bapiHeaderValues, postData, serviceName){
	console.time('Instrument-BAPI-' + serviceName);

	bapiOptions.headers = makeHeaders(bapiHeaderValues);
	bapiOptions.headers['Content-Type'] = 'application/json';
	bapiOptions.path = augmentPathWithParams(bapiOptions.path, bapiOperations.parameters);

	// Invoke BAPI request
	// console.info(serviceName + 'Service: About to call ' + serviceName + ' BAPI');
	return bapi.doPost(postData, bapiOptions, null).then((output) => {
		// console.info(serviceName + 'Service: Callback from ' + serviceName + ' BAPI');
		if(typeof output === undefined || output.statusCode) {
			var bapiError = {};
			bapiError.status = output.statusCode;
			bapiError.message = output.message;
			bapiError.details = output.details;
			bapiError.serviceName = serviceName;
			return Q.reject(bapiError);
		} else {
			console.timeEnd(`Instrument-BAPI-${serviceName} ${bapiHeaders.locale}`);
			return output;
		}
	});
};

module.exports.bapiPromisePost = bapiPromisePost;
module.exports.bapiPromiseGet = bapiPromiseGet;
