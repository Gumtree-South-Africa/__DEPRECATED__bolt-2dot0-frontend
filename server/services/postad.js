'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptions')(config);

/**
 * @description A service class that talks to Post Ad BAPI
 * @constructor
 */
var PostAdService = function() {
	this.bapiOptions = bapiOptions;
};

/**
 * Gets a list of ads for homepage gallery
 */
PostAdService.prototype.quickpostAd = function(bapiHeaders, adJson) {
	// console.info('Inside PostAdService');

	// Prepare BAPI call
	this.bapiOptions.method = 'POST';
	this.bapiOptions.path = config.get('BAPI.endpoints.quickpostAd');

	// Invoke BAPI
	return require('./bapi/bapiPromisePost')(this.bapiOptions, bapiHeaders, adJson, 'quickpostAd');
};

module.exports = new PostAdService();
