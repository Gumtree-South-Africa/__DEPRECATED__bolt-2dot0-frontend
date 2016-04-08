"use strict";

var config = require('config');

var bapiOptions = require("./bapi/bapiOptions")(config);

/**
 * @description A service class that talks to SEO BAPI
 * @constructor
 */
var SeoService = function() {
	this.bapiOptions =	bapiOptions;
};

/**
 * Gets a list of SEO info for HomePage
 */
SeoService.prototype.getHPSeoData = function(requestId, locale) {
	// console.info("Inside HP SeoService");
	
	var seoData = {};
	
	seoData.pageTitle = "default.home.page.title.text";
	seoData.description = "home.page.desc.tag";
	seoData.robots = "index,follow";
	
	return seoData;
}

/**
 * Gets a list of SEO info for SRP
 */
SeoService.prototype.getSRPSeoData = function(requestId, locale) {
	// console.info("Inside SRP SeoService");

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.srpSeo');
	
	// Invoke BAPI
	return require("./bapi/bapiPromiseGet")(this.bapiOptions, requestId, locale, "srpSeo", null);
}

module.exports = new SeoService();
