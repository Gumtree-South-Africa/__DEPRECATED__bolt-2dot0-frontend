'use strict';

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Category BAPI
 * @constructor
 */
var CategoryService = function() {
};

/**
 * Gets a list of categories
 */
CategoryService.prototype.getCategoriesData = function(bapiHeaderValues, depth) {
	// console.info('Inside CategoryService');

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.categoryHomePage') + '?depth=' + depth
	}), bapiHeaderValues, 'category');
};

/**
 * Gets a list of categories given a location id
 */
CategoryService.prototype.getCategoriesDataWithLocId = function(bapiHeaderValues, depth, locationId) {
	// console.info('Inside CategoryService');

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.categoryHomePage') +
			'?depth=' + depth +
			locationId !== null ? '&locationId=' + locationId : ''
		}), bapiHeaderValues, 'category');
};

module.exports = new CategoryService();
