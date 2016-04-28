'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptions')(config);

/**
 * @description A service class that talks to Ad Gallery and Ad Statistics BAPI
 * @constructor
 */
var HomepageAdService = function() {
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of ads for homepage gallery
 */
HomepageAdService.prototype.getHomepageGallery = function(bapiHeaders) {
	// console.info('Inside HomepageGalleryService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.homepageGallery');
	
	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'homepageGallery');
};

/**
 * Gets a list of ads for gallery via AJAX
 */
HomepageAdService.prototype.getAjaxGallery = function(bapiHeaders, offset, limit) {
	// console.info('Inside HomepageGalleryService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.homepageGallery') + "?offset=" + offset + "&limit=" + limit;
	
	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'homepageGallery');
};

/**
 * Gets a list of ad statistics
 */
HomepageAdService.prototype.getAdStatistics = function(bapiHeaders) {
	// console.info('Inside HomepageAdStatisticsService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.adStatistics');
	
	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'adStatistics');
};

module.exports = new HomepageAdService();
