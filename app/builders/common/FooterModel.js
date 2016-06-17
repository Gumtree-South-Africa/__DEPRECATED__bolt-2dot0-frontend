'use strict';

let Q = require('q');
let _ = require('underscore');

let StringUtils = require(process.cwd() + '/app/utils/StringUtils');
let ModelBuilder = require('./ModelBuilder');

let pageurlJson = require(process.cwd() + '/app/config/pageurl.json');
let config = require('config');
let jsmin = require(process.cwd() + '/app/config/commonjsurl.js');

/**
 * @description A class that Handles the Footer Model
 * @constructor
 */
let FooterModel = function(secure, req, res) {
	// Local Variables
	this.secure = secure;
	this.locale = res.locals.config.locale;

	// Country specific variables from BAPI Config
	this.brandName = res.locals.config.name;
	this.country = res.locals.config.country;
	this.footerConfigData = res.locals.config.bapiConfigData.footer;
	this.jsAssets = res.locals.jsAssets;
};

FooterModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getFooterData());
};

// Function getFooterData
FooterModel.prototype.getFooterData = function() {
	let _this = this;
	let arrFunctions = [
		function(callback) {
			if (typeof callback !== 'function') {
				return;
			}

			let footerDeferred, data = {};

			// merge pageurl data
			_.extend(data, pageurlJson.footer);

			// merge footer config data from BAPI
			_.extend(data, _this.footerConfigData);

			// build data
			let urlProtocol = _this.secure ? 'https://' : 'http://';
			let urlHost = config.get('static.server.host') !== null ? urlProtocol + config.get('static.server.host') : '';
			let urlPort = config.get('static.server.port') !== null ? ':' + config.get('static.server.port') : '';
			let urlVersion = config.get('static.server.version') !== null ? '/' + config.get('static.server.version') : '';
			data.mainJSUrl = urlHost + urlPort + urlVersion + config.get('static.mainJSUrl');
			data.baseJSUrl = urlHost + urlPort + urlVersion + config.get('static.baseJSUrl');
			data.baseJSMinUrl = urlHost + urlPort + urlVersion + config.get('static.baseJSMinUrl');
			data.baseSVGDataUrl = urlHost + urlPort + urlVersion + config.get('static.baseSVGDataUrl');
			data.baseCSSUrl = urlHost + urlPort + urlVersion + config.get('static.baseCSSUrl');
			data.baseImageUrl = urlHost + urlPort + urlVersion + config.get('static.baseImageUrl');
			data.min = config.get('static.min');

			// add complex data to footer
			_this.buildJs(data);
			_this.buildUrl(data);

			footerDeferred = Q.defer();
			footerDeferred.resolve(data);
			callback(null, data);
			return footerDeferred.promise;
		}
	];

	return arrFunctions;
};

//Build JS
FooterModel.prototype.buildJs = function(data) {

	let baseComponentDir = '/views/components/';

	data.javascripts = [];
	if (data.min) {
		data.javascripts.push(data.baseJSMinUrl + 'Main_' + this.locale + '.min.js');
	} else {

		/*//todo: remove comments after minification is done
		 jsAssets.forEach(function(jsFile){
		 data.javascripts.push(jsFile);
		 });*/


		for (let k = 0; k < jsmin[0].src.length; k++) {
			data.javascripts.push(data.baseJSUrl + jsmin[0].src[k]);
		}

		// @todo: Need to determine a way to detect which components will be used for a
		// given page.
		data.javascripts.push(baseComponentDir + 'header/js/header.js');
	}
};

//Build URL
FooterModel.prototype.buildUrl = function(data) {

	data.brandName = this.brandName;
	data.localeJSPath = '/' + this.brandName + '/' + this.country + '/' + this.locale + '/', data.countryJSPath = '/' + this.brandName + '/' + this.country + '/', data.brandJSPath = '/' + this.brandName + '/';
	data.obfuscatedCookieRightsURL = StringUtils.obfuscate(data.cookieNotice);
	data.obfuscatedPrivacyPolicyURL = StringUtils.obfuscate(data.privacyPolicy);
	data.obfuscatedTermsAndConditionsURL = StringUtils.obfuscate(data.termOfUse);
	data.locationSitemapLandingPageUrl = '/l-' + '/all-locs/v1b0';
	data.localizeApiRootUrl = '/rui-api/localize/rui/';
};

module.exports = FooterModel;
