'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptions')(config);

/**
 * @description A service class that talks to Ad Gallery and Ad Statistics BAPI
 * @constructor
 */
var HomepageAdService = function() {
	// BAPI server options for GET
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of ads for homepage gallery
 */
HomepageAdService.prototype.getHomepageGallery = function(requestId, locale) {
	// console.info('Inside HomepageGalleryService');

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.homepageGallery');
	
	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, requestId, locale, 'homepageGallery', null);
};

/**
 * Gets a list of ads for gallery via AJAX
 */
HomepageAdService.prototype.getAjaxGallery = function(requestId, locale, offset, limit) {
	// console.info('Inside HomepageGalleryService');

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.homepageGallery') + "?offset=" + offset + "&limit=" + limit;
	
	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, requestId, locale, 'homepageGallery', null);
};

/**
 * Gets a list of ad statistics
 */
HomepageAdService.prototype.getAdStatistics = function(requestId, locale) {
	// console.info('Inside HomepageAdStatisticsService');

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.adStatistics');
	
	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, requestId, locale, 'adStatistics', null);
};

module.exports = new HomepageAdService();
