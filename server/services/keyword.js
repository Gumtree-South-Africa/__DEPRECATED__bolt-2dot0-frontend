"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to Keyword BAPI
 * @constructor
 */
var KeywordService = function() {
	// BAPI server options for GET
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of top keywords
 */
KeywordService.prototype.getTopKeywordsData = function(requestId, locale) {
	// console.info("Inside Top KeywordService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.topKeywords');
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "topKeywords", null);
}

/**
 * Gets a list of trending keywords
 */
KeywordService.prototype.getTrendingKeywordsData = function(requestId, locale) {
	// console.info("Inside Trending KeywordService");

	// Prepare BAPI call
	this.bapiOptions.path = config.get('BAPI.endpoints.trendingKeywords');
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "trendingKeywords", null);
}


module.exports = new KeywordService();
