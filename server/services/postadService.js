'use strict';

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Post Ad BAPI
 * @constructor
 */
var PostAdService = function() {
};

/**
 * Gets a list of ads for homepage gallery
 */
PostAdService.prototype.quickpostAd = function(bapiHeaderValues, adJson) {
	// console.info('Inside PostAdService');

	// Invoke BAPI
	return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
		method: 'POST',
		path: config.get('BAPI.endpoints.quickpostAd')
	}), bapiHeaderValues, adJson, 'quickpostAd');
};

module.exports = new PostAdService();
