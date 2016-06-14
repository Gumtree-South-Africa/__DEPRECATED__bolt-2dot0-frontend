'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptionsModel')(config);
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Post Ad BAPI
 * @constructor
 */
var PostAdService = function() {
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of ads for homepage gallery
 */
PostAdService.prototype.quickpostAd = function(bapiHeaderValues, adJson) {
	// console.info('Inside PostAdService');

	// Prepare BAPI call
	this.bapiOptions.method = 'POST';
	this.bapiOptions.path = config.get('BAPI.endpoints.quickpostAd');

	// Invoke BAPI
	return bapiService.bapiPromisePost(this.bapiOptions, bapiHeaderValues, adJson, 'quickpostAd');
};

module.exports = new PostAdService();
