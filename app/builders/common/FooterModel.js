"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var StringUtils = require("../utils/StringUtils");
var ModelBuilder = require("./ModelBuilder");

var pageurlJson = require(process.cwd() + "/app/config/pageurl.json");
var config = require("config");

/** 
 * @description A class that Handles the Footer Model
 * @constructor
 */
var FooterModel = function (secure, locale) {
	// Local Variables
	this.secure = secure;
	this.locale = locale;
	
	// Country specific variables from BAPI Config
	this.brandName = "GumtreeZA";
	this.country = "ZA";
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
    		
    		// manipulate data
    		var urlProtocol = scope.secure ? "https://" : "http://";
    		var urlHost = config.get("static.server.host")!==null ? urlProtocol + config.get("static.server.host") : ""; 
    		var urlPort = config.get("static.server.port")!==null ? ":" + config.get("static.server.port") : "";
    		var urlVersion = config.get("static.server.version")!==null ? "/" + config.get("static.server.version") : "";
    		data.mainJSUrl = urlHost + urlPort + urlVersion + config.get("static.mainJSUrl");
    		data.baseJSUrl = urlHost + urlPort + urlVersion + config.get("static.baseJSUrl");
    		data.baseCSSUrl = urlHost + urlPort + urlVersion + config.get("static.baseCSSUrl");
    		data.baseImageUrl = urlHost + urlPort + urlVersion + config.get("static.baseImageUrl");
    		data.min = config.get("static.min");
    		
    		data.brandName = scope.brandName;
    		data.localeJSPath = "/" + scope.brandName + "/" + scope.country + "/" + scope.locale + "/",
    		data.countryJSPath = "/" + scope.brandName + "/" + scope.country + "/",
    		data.brandJSPath = "/" + scope.brandName + "/";
    		data.enableLighterVersionForMobile = "true && isMobileDevice";
    		data.obfuscatedCookieRightsURL = StringUtils.obfuscate(data.cookieNotice);
    		data.obfuscatedPrivacyPolicyURL = StringUtils.obfuscate(data.privacyPolicy);
    		data.obfuscatedTermsAndConditionsURL = StringUtils.obfuscate(data.termOfUse);
    		
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

module.exports = FooterModel;

