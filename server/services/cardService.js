'use strict';

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService      = require("./bapi/bapiService");

/**
 * Gets data based on the endpoint and parameters passed
 */
class CardService {

	getCardItemsData(bapiHeaderValues, queryEndpoint, params) {
		// Invoke BAPI
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET', path: config.get(queryEndpoint)	// todo: fixup path with parameters
		}), bapiHeaderValues, 'card');
	};
}

module.exports = new CardService();
