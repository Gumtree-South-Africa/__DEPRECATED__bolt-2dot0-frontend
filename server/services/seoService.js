'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptionsModel')(config);
var bapiService = require("./bapi/bapiService");

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
SeoService.prototype.getHPSeoData = function(bapiHeaderValues) {
	// console.info('Inside HP SeoService');
	
	var seoData = {};
	
	seoData.pageTitle = 'default.home.page.title.text';
	seoData.description = 'home.page.desc.tag';
	seoData.robots = 'index,follow';
	
	return seoData;
}

/**
 * Gets a list of SEO info for QuickPost
 */
SeoService.prototype.getQuickPostSeoData = function(bapiHeaderValues) {
	// console.info('Inside QuickPost SeoService');

	var seoData = {};

	seoData.pageTitle = 'quickpost.page.title';
	seoData.description = 'quickpost.page.desc';
	seoData.robots = 'index,follow';

	return seoData;
}


/**
 * Gets a list of SEO info for SRP
 */
SeoService.prototype.getSRPSeoData = function(bapiHeaderValues) {
	// console.info('Inside SRP SeoService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.srpSeo');
	
	// Invoke BAPI
	return bapiService.bapiPromiseGet(this.bapiOptions, bapiHeaderValues, 'srpSeo');
}

module.exports = new SeoService();
