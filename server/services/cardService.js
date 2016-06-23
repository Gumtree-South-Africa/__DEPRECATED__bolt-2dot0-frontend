'use strict';

let config = require('config');

let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

/**
 * Gets data based on the endpoint and parameters passed
 */
class CardService {

	getCardItemsData(bapiHeaderValues, queryEndpoint, parameters) {
		// Invoke BAPI

		// fixup path with parameters
		let path = config.get(queryEndpoint);
		let urlParams = '';

		for (let paramName in parameters) {
			if (parameters.hasOwnProperty(paramName)) {
				urlParams += `${urlParams.length > 0 ? '&' : ''}${paramName}=${encodeURIComponent(parameters[paramName])}`;
			}
		}

		if (urlParams.length > 0) {
			path += '?' + urlParams;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: path
		}), bapiHeaderValues, 'card');
	}
}

module.exports = new CardService();
