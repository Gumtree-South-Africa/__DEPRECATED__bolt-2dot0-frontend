'use strict';

var config = require('config');

var bapiOptions = require('./bapi/bapiOptions')(config);

/**
 * @description A service class that talks to SEO BAPI
 * @constructor
 */
var SeoService = function() {
	this.bapiOptions = bapiOptions;
};

/**
 * Gets a list of SEO info for HomePage
 */
SeoService.prototype.getHPSeoData = function(bapiHeaders) {
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
SeoService.prototype.getQuickPostSeoData = function(bapiHeaders) {
	// console.info('Inside QuickPost SeoService');

	var seoData = {};

	seoData.pageTitle = 'quickpost.page.title';
	seoData.description = 'quickpost.page.desc';
	seoData.robots = 'index,follow';

	return seoData;
}

/**
 * Gets a list of SEO info for PostAd
 */
SeoService.prototype.getPostSeoData = function(bapiHeaders) {
	// console.info('Inside Post SeoService');
	var seoData = {};
	seoData.pageTitle = 'postAd.page.title';
	seoData.description = 'postAd.page.desc';
	seoData.robots = 'index,follow';
	return seoData;
}

/**
 * Gets a list of SEO info for Login
 */
SeoService.prototype.getLoginSeoData = function(bapiHeaders) {
	// console.info('Inside Login SeoService');
	var seoData = {};
	seoData.pageTitle = 'login.page.title';
	seoData.description = 'login.page.desc';
	seoData.robots = 'noindex,follow';
	return seoData;
}

/**
 * Gets a list of SEO info for VIP
 */
SeoService.prototype.getVIPSeoData = function(bapiHeaders) {
	// console.info('Inside VIP SeoService');

	var seoData = {};
	seoData.pageTitle = 'title | locationSeoWord | adId';
	seoData.description = 'description trimmed to 140 chars...adId';
	seoData.robots = 'index,follow';
	return seoData;
}

/**
 * Gets a list of SEO info for SRP
 */
SeoService.prototype.getSRPSeoData = function(bapiHeaders) {
	// console.info('Inside SRP SeoService');

	// Prepare BAPI call
	this.bapiOptions.method = 'GET';
	this.bapiOptions.path = config.get('BAPI.endpoints.srpSeo');

	// Invoke BAPI
	return require('./bapi/bapiPromiseGet')(this.bapiOptions, bapiHeaders, 'srpSeo');
}

module.exports = new SeoService();
