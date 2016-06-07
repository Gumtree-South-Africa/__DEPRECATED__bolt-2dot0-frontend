'use strict';

var http = require('http');
var Q = require('q');
var _ = require('underscore');

var StringUtils = require(process.cwd() + '/app/utils/StringUtils');
var ModelBuilder = require('./ModelBuilder');

var pageurlJson = require(process.cwd() + '/app/config/pageurl.json');
var config = require('config');
var jsmin = require(process.cwd() + '/app/config/ruby/jsmin');

/**
 * @description A class that Handles the Footer Model
 * @constructor
 */
var FooterModel = function (secure, req, res) {
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
	var scope = this;
	var arrFunctions = [
		function (callback) {
			if (typeof callback !== 'function') {
				return;
			}

			var footerDeferred,
				data = {
				};

			// merge pageurl data
    		_.extend(data, pageurlJson.footer);

    		// merge footer config data from BAPI
    		_.extend(data, scope.footerConfigData);

    		// build data
    		var urlProtocol = scope.secure ? 'https://' : 'http://';
    		var urlHost = config.get('static.server.host')!==null ? urlProtocol + config.get('static.server.host') : '';
    		var urlPort = config.get('static.server.port')!==null ? ':' + config.get('static.server.port') : '';
    		var urlVersion = config.get('static.server.version')!==null ? '/' + config.get('static.server.version') : '';
    		data.mainJSUrl = urlHost + urlPort + urlVersion + config.get('static.mainJSUrl');
    		data.baseJSUrl = urlHost + urlPort + urlVersion + config.get('static.baseJSUrl');
    		data.baseJSMinUrl = urlHost + urlPort + urlVersion + config.get('static.baseJSMinUrl');
    		data.baseSVGDataUrl = urlHost + urlPort + urlVersion + config.get('static.baseSVGDataUrl');
				data.baseCSSUrl = urlHost + urlPort + urlVersion + config.get('static.baseCSSUrl');
    		data.baseImageUrl = urlHost + urlPort + urlVersion + config.get('static.baseImageUrl');
    		data.min = config.get('static.min');

    		// add complex data to footer
    		scope.buildJs(data);
    		scope.buildUrl(data);

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
	var scope = this;

	var baseComponentDir = '/views/components/';

	data.javascripts = [];
	if (data.min) {
		data.javascripts.push(data.baseJSMinUrl + 'Main_' + scope.locale + '.min.js');
	} else {

		/*//todo: remove comments after minification is done
		jsAssets.forEach(function(jsFile){
			data.javascripts.push(jsFile);
		});*/

		for(var k = 0; k < jsmin[0].src.length; k++){
		 	console.log('dataJSUrl: ',data.baseJSUrl + jsmin[0].src[k]);
			data.javascripts.push(data.baseJSUrl + jsmin[0].src[k]);
		}

		// @todo: Need to determine a way to detect which components will be used for a
		// given page.
		data.javascripts.push(baseComponentDir + 'header/js/header.js');
	}
};

//Build URL
FooterModel.prototype.buildUrl = function(data) {
	var scope = this;

	data.brandName = scope.brandName;
	data.localeJSPath = '/' + scope.brandName + '/' + scope.country + '/' + scope.locale + '/',
	data.countryJSPath = '/' + scope.brandName + '/' + scope.country + '/',
	data.brandJSPath = '/' + scope.brandName + '/';
	data.obfuscatedCookieRightsURL = StringUtils.obfuscate(data.cookieNotice);
	data.obfuscatedPrivacyPolicyURL = StringUtils.obfuscate(data.privacyPolicy);
	data.obfuscatedTermsAndConditionsURL = StringUtils.obfuscate(data.termOfUse);
	data.locationSitemapLandingPageUrl = '/l-' + '/all-locs/v1b0';
	data.localizeApiRootUrl = '/rui-api/localize/rui/';
};

module.exports = FooterModel;
