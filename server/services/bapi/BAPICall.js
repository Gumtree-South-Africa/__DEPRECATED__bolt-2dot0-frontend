"use strict";

var fs = require("fs");
var async = require("async");
var http = require("http");
var _ = require("underscore");

/** 
 * @description A class that Handles a BAPI REST call
 * @param {Object} options JSON with the call information
 * @param {Object} argData (Optional) JSON with the data to be merged with the data
 *     retrieved from the BAPI call (we merge the 2 data structures and
 *     pass it to the callback function)
 * @param {Function} callback (Optional) Function to be called after the data is 
 *     retrieved.
 * @constructor
 */
var BAPICall = function (options, argData, callback) {
	// By default, we ignore errors and we still call a callback if provided.
	this.ignoreError = true;

	this.callback = callback || null;
	this.argData = argData || {};
	this.options = options || {};
};

// *** Public Methods/Objects ***
BAPICall.prototype = {

	/**
 	 * @method setIgnoreError
 	 * @description Sets the ignore error flag
 	 * @param {Boolean} ignoreError Truth-value flag to ignore errors or not
 	 * @public
 	 */
	setIgnoreError : function (ignoreError) {
		this.ignoreError = ignoreError ? ignoreError : false;
	},

	/**
 	 * @method skipCurrentCall
 	 * @description Calls the object main callback if required, passing an 
 	 *     exception if needed (or null)
 	 * @param {Object} ex Exception or parameter to pass to the callback
 	 * @public
 	 */
	skipCurrentCall : function (ex, errdata) {
		var scope = this;
		if (scope.callback) {
			scope.callback(ex, errdata);
		}
	},

	/**
 	 * @method prepareGet
 	 * @description Prepares a REST Get call with predefined options
 	 * @public
 	 */
	prepareGet : function () {
		// options for GET
		var defaultOptions = {
		    port : 80,
		    method : "GET"
		};

		// Override the default options
		this.options = _.extend(defaultOptions, this.options);

		this.doGet();
	},

	/**
 	 * @method doGet
 	 * @description Does a REST Get call directly with the options
 	 *     passed in the constructor
 	 * @public
 	 */
	doGet : function () {
		var scope = this,
			data = {},
			reqGet = null,
			err = null;

		try {
			// Performs the GET request
			reqGet = http.request(scope.options, function(res) {
				data = {};
				var body = "";

		    	res.on("data", function(d) {
	        		var chunk = d.toString('utf-8');
	        		body += chunk;
		    	});

		    	res.on("end", function(d) {
		    		// parse JSON when data stream ends
		    		try {
		    			data = JSON.parse(body);
		    		} catch(ex) {
		    			data = {};
		    		}
		    		
					// Execute the callback if present.
					if (scope.callback) {
		        		// Aggregation of data with the original (passed) data
						if (! _.isEmpty(scope.argData)) { 
							data = _.extend(scope.argData, data);
						}
						// Any other HTTP Status code than 200 from BAPI, send to error handling, and return error data
			    		if  (res.statusCode !== 200) {
							scope.errorHandling(new Error("Received non-200 status"), data);
			    		} else {
			    			scope.callback(null, data);
			    		}
					}
					
					// Return success data
					return data;
		    	});
		 
			});

			reqGet.on("error", function(ex) {
				scope.errorHandling(ex);
			});

			// Close the request
			reqGet.end();	

		} catch (ex) {
			scope.errorHandling(ex);
		}
	},

	/**
 	 * @method preparePost
 	 * @description Prepares a REST Get call with predefined options
 	 * @param {Object} paramsObject Object with key value pairs/JSON of the
 	 *     parameters to be passed to the POST request
 	 * @public
 	 */
	preparePost : function (paramsObject) {
		var headers = {},
			scope = this,
			parObj = paramsObject || {},
			defaultOptions = {
		    	port : 80,
		    	method : "POST",
		    	headers : headers 
			};

		try {
			// Get the parameters serialized
			parObj = JSON.stringify(parObj);
			headers = this.getPostHeaders(parObj);
			this.options.headers = headers;

			// Override the default POST request options
			this.options = _.extend(defaultOptions, this.options);
			
			// Execute the post request with the parameters
			this.doPost(parObj);

		} catch (ex) {
			scope.errorHandling(ex);
		}
	},

	/**
 	 * @method getPostHeaders
 	 * @description Gets the post header object for the POST call
 	 * @param {Object} paramsObject Object with key value pairs/JSON of the
 	 *     parameters to be passed to the POST request
 	 * @public
 	 */
	getPostHeaders : function (paramsObject) {
		return {};
		/*
		return {
	    	'Content-Type' : 'application/json',
	    	'Content-Length' : Buffer.byteLength(paramsObject, 'utf8')
		};
		*/
	},

	/**
 	 * @method doPost
 	 * @description Does a REST POST call directly with the options
 	 *     passed in the constructor
 	 * @param {String} serializedData Serialized parameters passed as part of the request
 	 * @public
 	 */
	doPost : function (serializedData) {
		var data = {},
			scope = this,
			reqPost = null,
			err = null;

		try {
			reqPost = http.request(scope.options, function(res) {
				var body = "";
				res.setEncoding("utf8");

		    	res.on("data", function(d) {
					var chunk = d.toString('utf-8');
					body += chunk;
		    	});

		    	res.on("end", function(d) {
					// parse JSON when data stream ends
					try {
						data = JSON.parse(body);
					} catch(ex) {
						data = {};
					}

					// Execute the callback if present.
					if (scope.callback) {
						// Aggregation of data with the original (passed) data
						if (!_.isEmpty(scope.argData)) {
							data = _.extend(scope.argData, data);
						}
						// Any other HTTP Status code than 200 from BAPI, send to error handling, and return error data
						if (res.statusCode !== 200) {
							scope.errorHandling(new Error("Received non-200 status"), data);
						} else {
							scope.callback(null, data);
						}
					}

					return data;
		    	});

			});

			reqPost.on("error", function (ex) {
				scope.errorHandling(ex);
			});

			// Write the parametized/serialized data 
			reqPost.write(serializedData);

			// Close the request
			reqPost.end();

		} catch (ex) {
			scope.errorHandling(ex);
		}

	},

	/**
 	 * @method errorHandling
 	 * @description Processes an error passed as "ex" or ignores if null is passed
 	 * @param {Object} ex Exception object or null
 	 * @public
 	 */
	errorHandling: function(ex, errdata) {
		var err = ex;
		if (this.ignoreError) {
			err = null;
		}
		this.skipCurrentCall(err, errdata);
	}
}; // End prototype


// Export our "class"
module.exports = BAPICall;

