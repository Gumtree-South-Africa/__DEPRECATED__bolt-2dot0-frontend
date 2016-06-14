'use strict';

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Ad Gallery and Ad Statistics BAPI
 * @constructor
 */
var HomepageAdService = function() {
};

/**
 * Gets a list of ads for homepage gallery
 */
HomepageAdService.prototype.getHomepageGallery = function(bapiHeaderValues) {
	// console.info('Inside HomepageGalleryService');

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.homepageGallery')
	}), bapiHeaderValues, 'homepageGallery');
};

/**
 * Gets a list of ads for gallery via AJAX
 */
HomepageAdService.prototype.getAjaxGallery = function(bapiHeaderValues, offset, limit) {
	// console.info('Inside HomepageGalleryService');

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.homepageGallery') + "?offset=" + offset + "&limit=" + limit
	}), bapiHeaderValues, 'homepageGallery');
};

/**
 * Gets a list of ad statistics
 */
HomepageAdService.prototype.getAdStatistics = function(bapiHeaderValues) {
	// console.info('Inside HomepageAdStatisticsService');

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.adStatistics')
	}), bapiHeaderValues, 'adStatistics');
};

module.exports = new HomepageAdService();
