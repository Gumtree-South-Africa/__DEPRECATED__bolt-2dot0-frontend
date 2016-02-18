"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var hpAdService = require(process.cwd() + "/server/services/homepage-ads");


/** 
 * @description A class that Handles the Gallery Model
 * @constructor
 */
var GalleryModel = function (requestId, locale) {
	this.requestId = requestId;
	this.locale = locale;
    // return new ModelBuilder(this.getHomePageGallery());
};

GalleryModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getHomePageGallery());
};

// Function getHomePageGallery
GalleryModel.prototype.getHomePageGallery = function() {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var galleryDeferred,
				data = {};
			if (typeof callback !== "function") {
				return;
			}
			
		    if (typeof scope.locale !== "undefined") {
		    	galleryDeferred = Q.defer();
				console.log("Calling AdService for Homepage - gallery");
			    
				 Q(hpAdService.getHomepageGallery(scope.requestId, scope.locale))
			    	.then(function (dataReturned) {
			    		data = dataReturned;
			    		galleryDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						galleryDeferred.reject(new Error(err));
					    callback(null, data);
					});

				return galleryDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];
	
	return arrFunctions;
};

module.exports = GalleryModel;

