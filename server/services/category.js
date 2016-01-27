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
CategoryService.prototype.getCategoriesData = function(locale, depth) {
	console.log("Inside CategoryService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.categoryHomePage');
	if (this.bapiOptions.parameters != undefined) {
		this.bapiOptions.path = this.bapiOptions.path + "?" + this.bapiOptions.parameters + "&depth=" + depth;
	} else {
		this.bapiOptions.path = this.bapiOptions.path + "?depth=" + depth;
	}

	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, locale, "category");
}

module.exports = new CategoryService();
