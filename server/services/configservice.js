"use strict";


let config = require('config');


/**
 * @description A service class that talks to Config BAPI
 * @constructor
 */
class ConfigService {
	constructor() {
		this.bapiOptions = require("./bapi/bapiOptions")(config);
	}

	/**
	 * Get ZK Config given a locale
	 */
	getConfigData(bapiHeaders) {
		// console.info("Inside ConfigService", bapiHeaders);

		// Prepare BAPI call
		this.bapiOptions.method = 'GET';
		this.bapiOptions.path = config.get('BAPI.endpoints.configService');

		// Invoke BAPI
		return require("./bapi/bapiPromiseGet")(this.bapiOptions, bapiHeaders, "getConfig");
	}

	/**
	 * Update ZK Config for a given locale
	 */
	updateConfigData(bapiHeaders, configDataJson) {
		// console.info("Inside ConfigService", bapiHeaders);

		// Prepare BAPI call
		this.bapiOptions.method = 'PUT';
		this.bapiOptions.path = config.get('BAPI.endpoints.updateConfig');

		// Invoke BAPI
		return require('./bapi/bapiPromisePost')(this.bapiOptions, bapiHeaders, configDataJson, 'updateConfig');
	}
}

module.exports = new ConfigService();
