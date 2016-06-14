"use strict";


var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to Keyword BAPI
 * @constructor
 */
var KeywordService = function() {
};

/**
 * Gets a list of top keywords
 */
KeywordService.prototype.getTopKeywordsData = function(bapiHeaderValues, kwCount) {
	// console.info("Inside Top KeywordService");

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.topKeywords') + (typeof kwCount !== 'undefined') && (kwCount !== null) ? '?limit=' + kwCount : ''
	}), bapiHeaderValues, "topKeywords");
}

/**
 * Gets a list of trending keywords
 */
KeywordService.prototype.getTrendingKeywordsData = function(bapiHeaders, kwCount) {
	// console.info("Inside Trending KeywordService");

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.trendingKeywords') + (typeof kwCount !== 'undefined') && (kwCount !== null) ? '?limit=' + kwCount : ''
	}), bapiHeaders, "trendingKeywords");
}


module.exports = new KeywordService();
