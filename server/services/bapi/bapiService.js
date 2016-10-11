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
		//TODO: loginhack
		let cookie = 'rO0ABXNyAD1vcmcuc3ByaW5nZnJhbWV3b3JrLnNlY3VyaXR5LmNvcmUuY29udGV4dC5TZWN1cml0eUNvbnRleHRJbXBsAAAAAAAAAZACAAFMAA5hdXRoZW50aWNhdGlvbnQAMkxvcmcvc3ByaW5nZnJhbWV3b3JrL3NlY3VyaXR5L2NvcmUvQXV0aGVudGljYXRpb247eHBzcgBPb3JnLnNwcmluZ2ZyYW1ld29yay5zZWN1cml0eS5hdXRoZW50aWNhdGlvbi5Vc2VybmFtZVBhc3N3b3JkQXV0aGVudGljYXRpb25Ub2tlbgAAAAAAAAGQAgACTAALY3JlZGVudGlhbHN0ABJMamF2YS9sYW5nL09iamVjdDtMAAlwcmluY2lwYWxxAH4ABHhyAEdvcmcuc3ByaW5nZnJhbWV3b3JrLnNlY3VyaXR5LmF1dGhlbnRpY2F0aW9uLkFic3RyYWN0QXV0aGVudGljYXRpb25Ub2tlbtOqKH5uR2QOAgADWgANYXV0aGVudGljYXRlZEwAC2F1dGhvcml0aWVzdAAWTGphdmEvdXRpbC9Db2xsZWN0aW9uO0wAB2RldGFpbHNxAH4ABHhwAXNyACZqYXZhLnV0aWwuQ29sbGVjdGlvbnMkVW5tb2RpZmlhYmxlTGlzdPwPJTG17I4QAgABTAAEbGlzdHQAEExqYXZhL3V0aWwvTGlzdDt4cgAsamF2YS51dGlsLkNvbGxlY3Rpb25zJFVubW9kaWZpYWJsZUNvbGxlY3Rpb24ZQgCAy173HgIAAUwAAWNxAH4ABnhwc3IAE2phdmEudXRpbC5BcnJheUxpc3R4gdIdmcdhnQMAAUkABHNpemV4cAAAAAB3BAAAAAB4cQB+AA1zcgBIb3JnLnNwcmluZ2ZyYW1ld29yay5zZWN1cml0eS53ZWIuYXV0aGVudGljYXRpb24uV2ViQXV0aGVudGljYXRpb25EZXRhaWxzAAAAAAAAAZACAAJMAA1yZW1vdGVBZGRyZXNzdAASTGphdmEvbGFuZy9TdHJpbmc7TAAJc2Vzc2lvbklkcQB+AA94cHQACTEyNy4wLjAuMXBwc3IAQWNvbS5lYmF5LmVjZy5ib2x0LnBsYXRmb3JtLnNoYXJlZC5jb21tb24uc2VjdXJpdHkuQm9sdFVzZXJEZXRhaWxzC/JhrQF9LBMCAAJMAAtkaXNwbGF5TmFtZXEAfgAPTAAKdXNlckNvb2tpZXQAPkxjb20vZWJheS9lY2cvYm9sdC9wbGF0Zm9ybS9zaGFyZWQvY29tbW9uL3NlY3VyaXR5L1VzZXJDb29raWU7eHIAMm9yZy5zcHJpbmdmcmFtZXdvcmsuc2VjdXJpdHkuY29yZS51c2VyZGV0YWlscy5Vc2VyAAAAAAAAAZACAAdaABFhY2NvdW50Tm9uRXhwaXJlZFoAEGFjY291bnROb25Mb2NrZWRaABVjcmVkZW50aWFsc05vbkV4cGlyZWRaAAdlbmFibGVkTAALYXV0aG9yaXRpZXN0AA9MamF2YS91dGlsL1NldDtMAAhwYXNzd29yZHEAfgAPTAAIdXNlcm5hbWVxAH4AD3hwAQEBAXNyACVqYXZhLnV0aWwuQ29sbGVjdGlvbnMkVW5tb2RpZmlhYmxlU2V0gB2S0Y+bgFUCAAB4cQB+AApzcgARamF2YS51dGlsLlRyZWVTZXTdmFCTle2HWwMAAHhwc3IARm9yZy5zcHJpbmdmcmFtZXdvcmsuc2VjdXJpdHkuY29yZS51c2VyZGV0YWlscy5Vc2VyJEF1dGhvcml0eUNvbXBhcmF0b3IAAAAAAAABkAIAAHhwdwQAAAAAeHB0AA1rYmVrQGViYXkuY29tdAAAc3IAPGNvbS5lYmF5LmVjZy5ib2x0LnBsYXRmb3JtLnNoYXJlZC5jb21tb24uc2VjdXJpdHkuVXNlckNvb2tpZQAAAAAAAAABAgANWgAabG9nZ2VkSW5Vc2luZ1NvY2lhbFNlcnZpY2VaAApyZWdpc3RlcmVkTAAOZG91YmxlUG9zdGFibGV0ABNMamF2YS9sYW5nL0Jvb2xlYW47TAAFZW1haWxxAH4AD0wAE2ZhY2Vib29rQWNjZXNzVG9rZW5xAH4AD0wACmZhY2Vib29rSWRxAH4AD0wACWZpcnN0TmFtZXEAfgAPTAACaWR0ABBMamF2YS9sYW5nL0xvbmc7TAAFc3RhdGV0ADlMY29tL2ViYXkvZWNnL2JvbHQvcGxhdGZvcm0vc2hhcmVkL2VudGl0eS91c2VyL1VzZXJTdGF0ZTtMAAl0aW1lc3RhbXBxAH4AIUwABnVzZXJJZHQANkxjb20vZWJheS9lY2cvYm9sdC9wbGF0Zm9ybS9zaGFyZWQvZW50aXR5L3VzZXIvVXNlcklkO0wAE3VzZXJQcm9maWxlSW1hZ2VVcmxxAH4AD0wACHVzZXJuYW1lcQB+AA94cAAAcHEAfgAdcQB+AB5wcQB+AB5zcgAOamF2YS5sYW5nLkxvbmc7i+SQzI8j3wIAAUoABXZhbHVleHIAEGphdmEubGFuZy5OdW1iZXKGrJUdC5TgiwIAAHhwAAAAAAZeDVxwc3EAfgAlAAABV1jx4+VzcgA0Y29tLmViYXkuZWNnLmJvbHQucGxhdGZvcm0uc2hhcmVkLmVudGl0eS51c2VyLlVzZXJJZAAAAAAAAAABAgAAeHIANmNvbS5lYmF5LmVjZy5ib2x0LnBsYXRmb3JtLnNoYXJlZC5lbnRpdHkuRW50aXR5SWRMb25nMQAAAAAAAAABAgAAeHIAPGNvbS5lYmF5LmVjZy5ib2x0LnBsYXRmb3JtLnNoYXJlZC5lbnRpdHkuRW50aXR5SWRDb21wYXJhYmxlMQAAAAAAAAABAgACTAAHZW5jb2RlZHEAfgAPTAAScHJpbWFyeUFuZFNoYXJkS2V5dAAWTGphdmEvbGFuZy9Db21wYXJhYmxlO3hwdAAOMTAxMTA2ODI3MTAwMDlxAH4AJ3BxAH4AHg==__v1__1AC09D245EFAE5A56431';
		// headers['Authorization'] = 'Bearer ' +  bapiHeaderValues.authTokenValue;
		headers['Authorization'] = 'Bearer ' +  cookie;
	}
	return headers;
};

/**
 * augment the path  with both the parameterString and extraParameter collection specified
 * @param path {string} it may already have parameters
 * @param parametersString {string}
 * @param extraParameters {Object}
 * @returns {*}
 */
var augmentPathWithParams = function(path, parametersString, extraParameters) {
	var newPath = path;

	// fixup path with parameters
	let urlParams = '';

	if (parametersString !== undefined && parametersString !== null) {
		urlParams += `${urlParams.length > 0 ? '&' : ''}${parametersString}`;
	}

	for (let paramName in extraParameters) {
		if (extraParameters.hasOwnProperty(paramName)) {
			urlParams += `${urlParams.length > 0 ? '&' : ''}${paramName}=${encodeURIComponent(extraParameters[paramName])}`;
		}
	}

	// tack them on if we got some
	if (urlParams.length > 0) {
		if ( path.indexOf('?') > -1 ) {
			// existing path has some already
			newPath += '&' + urlParams;
		} else {
			newPath += '?' + urlParams;
		}
	}

	return newPath;
}

var bapiPromiseGet = function(bapiOptions, bapiHeaderValues, serviceName){
	console.time(`${process.pid} Instrument-BAPI-${serviceName} ${bapiHeaderValues.locale}`);

	bapiOptions.headers = makeHeaders(bapiHeaderValues);
	bapiOptions.path = augmentPathWithParams(bapiOptions.path, bapiOptions.parameters, bapiOptions.extraParameters);

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
			console.timeEnd(`${process.pid} Instrument-BAPI-${serviceName} ${bapiHeaderValues.locale}`);
			return output;
		}
	});
};



var bapiPromisePost = function(bapiOptions, bapiHeaderValues, postData, serviceName){
	console.time(`${process.pid} Instrument-BAPI-${serviceName} ${bapiHeaderValues.locale}`);

	bapiOptions.headers = makeHeaders(bapiHeaderValues);
	bapiOptions.headers['Content-Type'] = 'application/json';
	bapiOptions.path = augmentPathWithParams(bapiOptions.path, bapiOptions.parameters);

	// special fix when running in mock mode (using server/config/mock.json) during POST
	if ((serviceName === "saveDraftAd" || serviceName === "postAd" || serviceName === 'authRegister') &&
		(bapiOptions.parameters && bapiOptions.parameters.indexOf("_statusCode=200") > -1)) {
		// we're in mock mode, and we need to tell mock server to return a 201 (Created), otherwise it will send us 500, because a 200 is not available
		bapiOptions.path = bapiOptions.path.replace("_statusCode=200", "_statusCode=201");
	}

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
			console.timeEnd(`${process.pid} Instrument-BAPI-${serviceName} ${bapiHeaderValues.locale}`);
			return output;
		}
	});
};

// returns string formatted for use in BAPI api's
// format is (<lat>,<long>)
var bapiFormatLatLng = (geoLatLngObj) => {
	return '(' + geoLatLngObj.lat + ',' + geoLatLngObj.lng + ')';
};

module.exports.bapiPromisePost = bapiPromisePost;
module.exports.bapiPromiseGet = bapiPromiseGet;
module.exports.bapiFormatLatLng = bapiFormatLatLng;

