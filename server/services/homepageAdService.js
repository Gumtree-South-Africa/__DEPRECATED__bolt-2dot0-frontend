'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptionsModel')(config);
var bapiService = require("./bapi/bapiService");

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
HomepageAdService.prototype.getHomepageGallery = function(bapiHeaderValues) {
	// console.info('Inside HomepageGalleryService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.homepageGallery');
	
	// Invoke BAPI
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaderValues, 'homepageGallery');
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
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaders, 'homepageGallery');
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
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaders, 'adStatistics');
};

module.exports = new HomepageAdService();
