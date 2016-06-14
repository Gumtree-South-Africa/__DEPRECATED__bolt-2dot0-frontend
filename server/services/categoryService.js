'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptionsModel')(config);
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Category BAPI
 * @constructor
 */
var CategoryService = function() {
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of categories
 */
CategoryService.prototype.getCategoriesData = function(bapiHeaderValues, depth) {
	// console.info('Inside CategoryService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage') + '?depth=' + depth;

	// Invoke BAPI
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaderValues, 'category');
};

/**
 * Gets a list of categories given a location id
 */
CategoryService.prototype.getCategoriesDataWithLocId = function(bapiHeaderValues, depth, locationId) {
	// console.info('Inside CategoryService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage') + '?depth=' + depth;
	if (locationId !== null) {
		this.bapiOptions.path = this.bapiOptions.path + '&locationId=' + locationId;
	}

	// Invoke BAPI
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaderValues, 'category');
};

module.exports = new CategoryService();
