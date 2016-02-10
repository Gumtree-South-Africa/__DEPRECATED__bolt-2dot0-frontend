"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");

var userService = require(process.cwd() + "/server/services/user");
var pageurlJson = require(process.cwd() + "/app/config/pageurl.json");
var pagetypeJson = require(process.cwd() + "/app/config/pagetype.json");
var config = require("config");

/** 
 * @description A class that Handles the Header Model
 * @constructor
 */

var HeaderModel = function (secure, req, res) {
	// ENV variables
	this.baseDomainSuffix = typeof process.env.BASEDOMAINSUFFIX!=="undefined" ? "." + process.env.BASEDOMAINSUFFIX : "";
	this.basePort = typeof process.env.PORT!=="undefined" ? ":" + process.env.PORT : "";
	
	// Local variables
	var cookieName = "bt_auth";
	var authcookie = req.cookies[cookieName];	    
	this.secure = secure;
	this.requestId = req.requestId;
	this.cookie = authcookie;
	this.locale = res.config.locale;
	this.brandName = res.config.name;
	this.country = res.config.country;
	this.fullDomainName = res.config.hostname;
	this.urlProtocol = this.secure ? "https://" : "http://";
	this.statusParam = req.query.status;
	this.resumeParam = req.query.resumeabandonedordererror;
	this.headerConfigData = res.config.bapiConfigData.header;

	return new ModelBuilder(this.getHeaderData());
};


// Function getHeaderData
HeaderModel.prototype.getHeaderData = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var headerDeferred,
				data = {
					"favIcon" : "/images/" + scope.locale + "/shortcut.png",
		    		"homePageUrl" : scope.urlProtocol + "www." + scope.fullDomainName + scope.baseDomainSuffix + scope.basePort
				};
			
			// merge pageurl data
    		_.extend(data, pageurlJson.header);

    		// merge header config data from BAPI
    		_.extend(data, scope.headerConfigData);
    		
    		// build data
    		var urlProtocol = scope.secure ? "https://" : "http://";
    		var urlHost = config.get("static.server.host")!==null ? urlProtocol + config.get("static.server.host") : ""; 
    		var urlPort = config.get("static.server.port")!==null ? ":" + config.get("static.server.port") : "";
    		var urlVersion = config.get("static.server.version")!==null ? "/" + config.get("static.server.version") : "";
    		data.baseImageUrl = urlHost + urlPort + urlVersion + config.get("static.baseImageUrl");
    		data.baseCSSUrl = urlHost + urlPort + urlVersion + config.get("static.baseCSSUrl");
    		data.min = config.get("static.min");
    		
    		scope.buildUrl(data);
    		scope.buildCss(data);
    		scope.buildOpengraph(data);
    		scope.buildMessages(data);
    		
    		// manipulate data
//    		// data.enableLighterVersionForMobile = "true && isMobileDevice";

			if (typeof callback !== "function") {
				return;
			}
		    if (typeof scope.cookie !== "undefined") {
		    	headerDeferred = Q.defer();
				console.log("Calling Service to get HeaderData");
			    
				 Q(userService.getUserFromCookie(scope.requestId, scope.cookie, scope.locale))
			    	.then(function (dataReturned) {
			    		// merge returned data
			    		_.extend(data, dataReturned);
			    					    		
			    		headerDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						headerDeferred.reject(new Error(err));
					    callback(null, data);
					});

				return headerDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];
	
	return arrFunctions;
};

// Build URL
HeaderModel.prototype.buildUrl = function(data) {
	var scope = this;
	
	data.touchIconIphoneUrl = data.baseImageUrl + "touch-iphone.png";
	data.touchIconIpadUrl = data.baseImageUrl + "touch-ipad.png";
	data.touchIconIphoneRetinaUrl = data.baseImageUrl + "touch-iphone-retina.png";
	data.touchIconIpadRetinaUrl = data.baseImageUrl + "touch-ipad-retina.png";
	data.shortuctIconUrl = data.baseImageUrl + scope.locale + "/shortcut.png";
	data.autoCompleteUrl = data.homePageUrl + data.autoCompleteUrl + scope.locale + "/{catId}/{locId}/{value}";
	data.geoLocatorUrl = data.homePageUrl + data.geoLocatorUrl + scope.locale + "/{lat}/{lng}";
	data.rootGeoLocatorUrl = data.homePageUrl + data.rootGeoLocatorUrl + scope.locale + "/0/category/0";
};

//Build CSS
HeaderModel.prototype.buildCss = function(data) {
	var scope = this;

	data.iconsCSSURLs = [];
	data.iconsCSSURLs.push(data.baseCSSUrl + "icons.data.svg" + "_" + scope.locale + ".css");
	data.iconsCSSURLs.push(data.baseCSSUrl + "icons.data.png" + "_" + scope.locale + ".css");
	data.iconsCSSURLs.push(data.baseCSSUrl + "icons.data.fallback" + "_" + scope.locale + ".css");
	data.iconsCSSFallbackUrl = data.baseCSSUrl + "icons.data.fallback" + "_" + scope.locale + ".css";

	data.continerCSS = [];
	if (data.min) {
		// TODO add device detection and add /all CSS
		data.continerCSS.push(data.baseCSSUrl + "mobile/" + scope.brandName + "/" + scope.country + "/" + scope.locale + "/Main.min.css");
	} else {
		data.continerCSS.push(data.baseCSSUrl + "mobile/" + scope.brandName + "/" + scope.country + "/" + scope.locale + "/Main.css");
	}
	data.localeCSSPathHack = data.baseCSSUrl + "all/" + scope.brandName + "/" + scope.country + "/" + scope.locale + "/";
};

//Build opengraph
HeaderModel.prototype.buildOpengraph = function(data) {
	var scope = this;
	
	data.brandName = scope.brandName;
	data.countryName = scope.country;
	data.logoUrl = data.baseImageUrl + scope.locale + "/logo.png";
	data.logoUrlOpenGraph = data.baseImageUrl + scope.locale + "/logoOpenGraph.png";
};

// Handle Input Parameters
HeaderModel.prototype.buildMessages = function(data) {
	var scope = this;
	data.pageMessages = {};
	switch(scope.statusParam){
		case "userregistered" :
			data.pageMessages.success ="home.user.registered";
			data.pageType = pagetypeJson.pagetype.USER_REGISTRATION_SUCCESS;
			break;
		case "adinactive":
			data.pageMessages.success = "home.ad.notyetactive";
			break;
		case "resetpassword":
			data.pageMessages.success = "home.reset.password.success";
			data.pageType = pagetypeJson.pagetype.PASSWORD_RESET_SUCCESS;
			break;
		default:
			data.pageMessages.success = "";
			data.pageMessages.error = "";
			data.pageType = "";
	}
	switch (scope.resumeParam){
		case "adnotactive":
			data.pageMessages.error = "abandonedorder.adNotActive";
			break;
		case "adfeaturepaid":
			data.pageMessages.error = "abandonedorder.adFeaturePaid.multiple_ads";
			break;
	}
};

module.exports = HeaderModel;

