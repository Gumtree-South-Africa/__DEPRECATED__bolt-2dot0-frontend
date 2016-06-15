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
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get(params.queryEndpoint)	// todo: fixup path with parameters
	}), bapiHeaderValues, 'card');
};

module.exports = new CardService();
