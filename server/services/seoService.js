'use strict';

var config = require('config');

var bapiOptionsModel = require("./bapi/bapiOptionsModel");
var bapiService = require("./bapi/bapiService");

/**
 * @description A service class that talks to SEO BAPI
 * @constructor
 */
var SeoService = function() {
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

	// Invoke BAPI
	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		method: 'GET',
		path: config.get('BAPI.endpoints.srpSeo')
	}), bapiHeaderValues, 'srpSeo');
}

module.exports = new SeoService();
