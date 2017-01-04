'use strict';

const fs = require('fs'),
	async = require('async'),
	http = require('http'),
	httpProxyAgent = require('http-proxy-agent'),
	https = require('https'),
	httpsProxyAgent = require('https-proxy-agent'),
	_ = require('underscore'),
	Q = require('q'),
	BapiError = require(`${process.cwd()}/server/services/bapi/BapiError`);

let proxyHost = process.env.PROXY_HOST || '';
let proxyPort = process.env.PROXY_PORT || '';


/**
 * @description A class that Handles any REST call
 * @constructor
 */
var RESTCall = function() {
	// By default, we ignore errors and we still call a callback if provided.
};

let parseResponse = (res, argData) => {

	let data = {}, body = '';

	return Q.Promise((resolve, reject) => {

		res.setEncoding('utf8');

		res.on('data', d => {
			body += d.toString('utf-8');
		});

		res.on('end', () => {
			// parse JSON when data stream ends
			try {
				if (!_.isEmpty(body)) {
					data = JSON.parse(body);
				}
			} catch (ex) {
				let message = `Unable to parse JSON ${ex.message} status: ${res.statusCode} contentType: ${res.headers['content-type']} ${res.req._headers["x-bolt-site-locale"]} path: ${res.req.path} body sample: ${body.length > 30 ? body.substr(0, 30) : 'too small to sample'}`;
				console.error(message);
				reject(new BapiError(message));
			}
			if (!_.isEmpty(argData)) {
				data = _.extend(argData, data);
			}
			// Any other HTTP Status code than 200 from BAPI, send to error handling, and return error data
			if (!(res.statusCode === 200 || res.statusCode === 201)) {
				let bapiJson;
				// attach the status code so consumers can check for it
				if (res.headers['content-type'].indexOf("application/json") !== -1) {
					// attach the json so consumers can use it
					bapiJson = data;
				}
				let error = new BapiError(`Received non-200 status: ${res.statusCode} for ${res.req._headers["x-bolt-site-locale"]} ${res.req.path}`, {
					statusCode: res.statusCode,
					bapiJson: bapiJson
				});
				reject(error);
			} else {
				resolve(data);
			}
		});
	});
};

let setupConnection = params => {

	let options = params.options,
		argData = params.argData,
		serializedData = params.serializedData;

	return Q.Promise((resolve, reject) => {
		let mod = options.protocol === 'https:' ? https : http;

		if ((typeof options.useProxy !== 'undefined') && (options.useProxy === true)) {
			if (!_.isEmpty(proxyHost) && !_.isEmpty(proxyPort)) {
				let proxy = {
					hostname: proxyHost,
					port: proxyPort
				};
				let proxymod = options.protocol === 'https:' ? httpsProxyAgent : httpProxyAgent;
				let agent = new proxymod(proxy);
				options.agent = agent;
			}
		}

		let request = mod.request(options, res => {
			resolve(parseResponse(res, argData));
		});

		request.on("socket", (socket) => {
			socket.setTimeout(Number(options.timeout));
			socket.on("timeout", function() {
				request.abort();
			});
		});

		request.on('error', (ex) => {
			reject(ex);
		});

		if (!_.isEmpty(serializedData)) {
			request.write(serializedData);
		}

		// Close the request
		request.end();
	});
};

// *** Public Methods/Objects ***
RESTCall.prototype = {
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

	doGet: (options, argData) => {
		return setupConnection({options: options, argData: argData});
	},

	/**
	 * @method doConnectWithBody
	 * @description Does a REST call directly with the options and body
	 *     passed in the constructor
	 * @param {String} serializedData Serialized parameters passed as part of the request
	 * @param {Object} options JSON with the call information
	 * @param {Object} argData (Optional) JSON with the data to be merged with the data
	 *     retrieved from the BAPI call (we merge the 2 data structures and
	 *     pass it to the callback function)
	 * @public
	 */
	doConnectWithBody: function(serializedData, options, argData) {
		return setupConnection({options: options, argData: argData, serializedData: serializedData});
	}
}; // End prototype

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
// It's actually an alias for doConnectWithBody
RESTCall.prototype.doPost = RESTCall.prototype.doConnectWithBody;


// Export our 'class'
module.exports = new RESTCall();

