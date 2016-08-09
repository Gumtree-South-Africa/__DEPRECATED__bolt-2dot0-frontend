'use strict';

var fs = require('fs');
var async = require('async');
var http = require('http');
var _ = require('underscore');
let Q = require('q');

/**
 * @description A class that Handles a BAPI REST call
 * @constructor
 */
var BAPICall = function () {
	// By default, we ignore errors and we still call a callback if provided.
};

// *** Public Methods/Objects ***
BAPICall.prototype = {

	/**
 	 * @method doGet
 	 * @description Does a REST Get call directly with the options
 	 *     passed in the constructor
	 * @param {Object} options JSON with the call information
	 * @param {Object} argData (Optional) JSON with the data to be merged with the data
	 *     retrieved from the BAPI call (we merge the 2 data structures and
	 *     pass it to the callback function)
 	 * @public
 	 */

	doGet : function (options, argData) {
		let data = {},
			reqGet = null;
		let deferred = Q.defer();

		try {
			// Performs the GET request
			reqGet = http.request(options, (res) => {
				data = {};
				var body = '';

		    	res.on('data', (d) => {
	        		body += d.toString('utf-8');
		    	});

		    	res.on('end', () => {
		    		// parse JSON when data stream ends
		    		try {
		    			data = JSON.parse(body);
		    		} catch(ex) {
		    			data = {};
						let message = `Unable to parse JSON ${ex.message} status: ${res.statusCode} contentType: ${res.headers['content-type']} path: ${res.req.path} body sample: ${body.length > 30 ? body.substr(0, 30) : 'too small to sample'}`;
						console.error(message);
					    deferred.reject(new Error(message));
		    		}
					if (! _.isEmpty(argData)) {
						data = _.extend(argData, data);
					}
					// Any other HTTP Status code than 200 from BAPI, send to error handling, and return error data
					if  (res.statusCode !== 200) {
						let error = new Error(`Received non-200 status: ${res.statusCode}`);
						// attach the status code so consumers can check for it
						error.statusCode = res.statusCode;
						deferred.reject(error, data);
					} else {
						deferred.resolve(data);
					}
		    	});

			});

			reqGet.on('error', (ex) => {
				deferred.reject(ex);
			});

			// Close the request
			reqGet.end();

		} catch (ex) {
			deferred.reject(ex);
		}
		return deferred.promise;
	},

	/**
 	 * @method doPost
 	 * @description Does a REST POST call directly with the options
 	 *     passed in the constructor
 	 * @param {String} serializedData Serialized parameters passed as part of the request
	 * @param {Object} options JSON with the call information
	 * @param {Object} argData (Optional) JSON with the data to be merged with the data
	 *     retrieved from the BAPI call (we merge the 2 data structures and
	 *     pass it to the callback function)
 	 * @public
 	 */
	doPost : function (serializedData, options, argData) {
		var data = {},
			reqPost = null,
			err = null;
		let deferred = Q.defer();

		try {
			reqPost = http.request(options, (res) => {
				var body = '';
				res.setEncoding('utf8');

		    	res.on('data', (d) => {
					body += d.toString('utf-8');
		    	});

		    	res.on('end', (d) => {
					data = {};
					// parse JSON when data stream ends
					try {
						if (!_.isEmpty(body)) {
							data = JSON.parse(body);
						}
					} catch(ex) {
						console.log(ex);
						deferred.reject(ex);
					}

					// Aggregation of data with the original (passed) data
					if (!_.isEmpty(argData)) {
						data = _.extend(argData, data);
					}
					// Any other HTTP Status code than 200 from BAPI, send to error handling, and return error data
					if (!(res.statusCode === 200 || res.statusCode === 201)) {
						let error = new Error(`Received non-200/201 status: ${res.statusCode}`);
						// attach the status code so consumers can check for it
						error.statusCode = res.statusCode;
						deferred.reject(error, data);
					} else {
						deferred.resolve(data);
					}
		    	});

			});

			reqPost.on('error', (ex) => {
				deferred.reject(ex);
			});

			// Write the parametized/serialized data
			reqPost.write(serializedData);

			// Close the request
			reqPost.end();

		} catch (ex) {
			deferred.reject(ex);
		}
		return deferred.promise;
	}
}; // End prototype


// Export our 'class'
module.exports = new BAPICall();

