"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var seoService = require(process.cwd() + "/server/services/seo");


/** 
 * @description A class that Handles the SEO Model
 * @constructor
 */
var SeoModel = function (requestId, locale) {
	this.requestId = requestId;
	this.locale = locale;
};

SeoModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getHPSeoInfo());
};


// Function getHPSeoInfo
SeoModel.prototype.getHPSeoInfo = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var seoDeferred,
				data = {};
			if (typeof callback !== "function") {
				return;
			}
			
		    if (typeof scope.locale !== "undefined") {
		    	seoDeferred = Q.defer();
				console.log("Calling Seo Service for Homepage");
			    
				 Q(seoService.getHPSeoData(scope.requestId, scope.locale))
			    	.then(function (dataReturned) {
			    		data = dataReturned;
			    		seoDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						seoDeferred.reject(new Error(err));
					    callback(null, data);
					});

				return seoDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];
	
	return arrFunctions;
};

module.exports = SeoModel;

