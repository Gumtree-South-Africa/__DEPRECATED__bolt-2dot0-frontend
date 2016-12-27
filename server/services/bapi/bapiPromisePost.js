'use strict';

var _ = require('underscore');
var Q = require('q');

let rest = require(process.cwd() + '/server/services/protocols/RESTCall');

module.exports = function(bapiOptions, bapiHeaders, postData, serviceName){
	console.time(`${process.pid} Instrument-BAPI-${serviceName} ${bapiHeaders.locale} ${bapiHeaders.requestId}`);

	// Add Headers
	bapiOptions.headers['Content-Type'] = 'application/json';
	bapiOptions.headers['X-BOLT-APPS-ID'] = 'RUI';
	if (typeof bapiHeaders.locale !== 'undefined' && !_.isEmpty(bapiHeaders.locale)) {
		bapiOptions.headers['X-BOLT-SITE-LOCALE'] = bapiHeaders.locale;
	}
	if (typeof bapiHeaders.requestId !== 'undefined' && !_.isEmpty(bapiHeaders.requestId)) {
		bapiOptions.headers['X-BOLT-TRACE-ID'] = bapiHeaders.requestId;
	}
	if (typeof bapiHeaders.ip !== 'undefined' && !_.isEmpty(bapiHeaders.ip)) {
		bapiOptions.headers['X-BOLT-IP-ADDRESS'] = bapiHeaders.ip;
	}
	if (typeof bapiHeaders.machineid !== 'undefined' && !_.isEmpty(bapiHeaders.machineid)) {
		bapiOptions.headers['X-BOLT-MACHINE-ID'] = bapiHeaders.machineid;
	}
	if (typeof bapiHeaders.useragent !== 'undefined' && !_.isEmpty(bapiHeaders.useragent)) {
		bapiOptions.headers['X-BOLT-USER-AGENT'] = bapiHeaders.useragent;
	}
	if (typeof bapiHeaders.authTokenValue !== 'undefined' && !_.isEmpty(bapiHeaders.authTokenValue)) {
		bapiOptions.headers['Authorization'] = 'Bearer ' +  bapiHeaders.authTokenValue;
	}

	// Add extra parameters
	if (bapiOptions.parameters != undefined) {
		if ( bapiOptions.path.indexOf('?') > -1 ) {
			bapiOptions.path = bapiOptions.path + '&' + bapiOptions.parameters;
		} else {
			bapiOptions.path = bapiOptions.path + '?' + bapiOptions.parameters;
		}
	}

	// console.log('$$$$$$$$$$$$$$$$$$', bapiOptions);
	// console.log('$$$$$$$$$$$$$$$$$$', postData);

	// Invoke BAPI request
	// console.info(serviceName + 'Service: About to call ' + serviceName + ' BAPI');
	return rest.doPost(postData, bapiOptions, null).then((output) => {
		// console.info(serviceName + 'Service: Callback from ' + serviceName + ' BAPI');
		if(typeof output === undefined || output.statusCode) {
			var bapiError = {};
			bapiError.status = output.statusCode;
			bapiError.message = output.message;
			bapiError.details = output.details;
			bapiError.serviceName = serviceName;
			return Q.reject(bapiError);
		} else {
			console.timeEnd(`${process.pid} Instrument-BAPI-${serviceName} ${bapiHeaders.locale} ${bapiHeaders.requestId}`);
			return output;
		}
	});
};
