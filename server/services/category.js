"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to Category BAPI
 * @constructor
 */
var CategoryService = function() {
	// BAPI server options for GET
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of categories
 */
CategoryService.prototype.getCategoriesData = function(requestId, locale, depth) {
	// console.info("Inside CategoryService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage');

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "category", null);
}

module.exports = new CategoryService();
