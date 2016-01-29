"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

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
HomepageAdService.prototype.getHomepageGallery = function(locale) {
	console.log("Inside HomepageGalleryService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.homepageGallery');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters;
	}
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, locale, "homepageGallery", null);
}

/**
 * Gets a list of ad statistics
 */
HomepageAdService.prototype.getAdStatistics = function(locale) {
	console.log("Inside HomepageAdStatisticsService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.adStatistics');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters;
	}
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, locale, "adStatistics", null);
}

module.exports = new HomepageAdService();
