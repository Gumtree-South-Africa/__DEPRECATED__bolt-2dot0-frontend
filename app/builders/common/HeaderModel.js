"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");

var userService = require(process.cwd() + "/server/services/user");
var pageurlJson = require(process.cwd() + "/app/config/pageurl.json");

/** 
 * @description A class that Handles the Header Model
 * @constructor
 */
var HeaderModel = function (secure, requestId, cookie, locale) {
	// ENV variables
	this.baseDomainSuffix = typeof process.env.BASEDOMAINSUFFIX!=="undefined" ? "." + process.env.BASEDOMAINSUFFIX : "";
	this.basePort = typeof process.env.PORT!=="undefined" ? ":" + process.env.PORT : "";
	
	// Local variables
	this.secure = secure;
	this.requestId = requestId;
	this.cookie = cookie;
	this.locale = locale;
	this.urlProtocol = this.secure ? "https://" : "http://";
	
	// Country specific variables from BAPI Config
	this.fullDomainName = "gumtree.co.za";
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

module.exports = HeaderModel;

