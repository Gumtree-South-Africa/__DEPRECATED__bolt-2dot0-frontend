"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var StringUtils = require(process.cwd() + "/app/utils/StringUtils");
var ModelBuilder = require("./ModelBuilder");

var pageurlJson = require(process.cwd() + "/app/config/pageurl.json");
var config = require("config");

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
};

FooterModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getFooterData());
};

// Function getFooterData
FooterModel.prototype.getFooterData = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var footerDeferred,
				data = {
				};
			
			// merge pageurl data
    		_.extend(data, pageurlJson.footer);
    		
    		// merge footer config data from BAPI
    		_.extend(data, scope.footerConfigData);
    		
    		// build data
    		var urlProtocol = scope.secure ? "https://" : "http://";
    		var urlHost = config.get("static.server.host")!==null ? urlProtocol + config.get("static.server.host") : ""; 
    		var urlPort = config.get("static.server.port")!==null ? ":" + config.get("static.server.port") : "";
    		var urlVersion = config.get("static.server.version")!==null ? "/" + config.get("static.server.version") : "";
    		data.mainJSUrl = urlHost + urlPort + urlVersion + config.get("static.mainJSUrl");
    		data.baseJSUrl = urlHost + urlPort + urlVersion + config.get("static.baseJSUrl");
    		data.baseCSSUrl = urlHost + urlPort + urlVersion + config.get("static.baseCSSUrl");
    		data.baseImageUrl = urlHost + urlPort + urlVersion + config.get("static.baseImageUrl");
    		data.min = config.get("static.min");
    		
    		scope.buildJs(data);
    		scope.buildUrl(data);
    		
    		if (typeof callback !== "function") {
				return;
			}
			
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
	
	data.javascripts = [];
	if (data.min) {
		data.javascripts.push(data.baseJSUrl + "Main_" + scope.locale + ".min.js");
	} else {
		data.javascripts.push(data.baseJSUrl + "libraries/jQuery/jquery-2.0.0.min.js");
		data.javascripts.push(data.baseJSUrl + "bower-components/requirejs/require.js");
		data.javascripts.push(data.baseJSUrl + "libraries/jQuery/plugins/jquery.smartbanner.js");
		data.javascripts.push(data.baseJSUrl + "common/utils/StringUtils.js");
		data.javascripts.push(data.baseJSUrl + "common/utils/JQueryUtil.js");
		data.javascripts.push(data.baseJSUrl + "common/device/MatchMedia.js");
		data.javascripts.push(data.baseJSUrl + "common/tracking/GoogleTag.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/main.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/json.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/cookie.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/storage.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/overlay.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/i18n.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/html5.js");
		data.javascripts.push(data.baseJSUrl + "common/bolt/Search.js");
		data.javascripts.push(data.baseJSUrl + "common/banners/GoogleBanner.js");
		data.javascripts.push(data.baseJSUrl + "common/banners/BannerCookie.js");
		data.javascripts.push(data.baseJSUrl + "common/tracking/Analytics.js");
		data.javascripts.push(data.baseJSUrl + "common/header/Header.js");
		data.javascripts.push(data.baseJSUrl + "common/header/searchbar.js");
	}
};

//Build URL
FooterModel.prototype.buildUrl = function(data) {
	var scope = this;
	
	data.brandName = scope.brandName;
	data.localeJSPath = "/" + scope.brandName + "/" + scope.country + "/" + scope.locale + "/",
	data.countryJSPath = "/" + scope.brandName + "/" + scope.country + "/",
	data.brandJSPath = "/" + scope.brandName + "/";
	data.obfuscatedCookieRightsURL = StringUtils.obfuscate(data.cookieNotice);
	data.obfuscatedPrivacyPolicyURL = StringUtils.obfuscate(data.privacyPolicy);
	data.obfuscatedTermsAndConditionsURL = StringUtils.obfuscate(data.termOfUse);
	data.locationSitemapLandingPageUrl = "/l-" + "/all-locs/v1b0";
	data.localizeApiRootUrl = "/rui-api/localize/rui/";
};

module.exports = FooterModel;

