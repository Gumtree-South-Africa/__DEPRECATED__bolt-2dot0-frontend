'use strict';

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * Gets a list of ads for homepage gallery
 */
CardService.prototype.quickpostAd = function(bapiHeaderValues, params) {
	// console.info('Inside PostAdService');

	// Invoke BAPI
	return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
		method: 'POST',
		path: config.get(params.queryEndpoint)
	}), bapiHeaderValues, adJson, 'card');
};

module.exports = new CardService();
