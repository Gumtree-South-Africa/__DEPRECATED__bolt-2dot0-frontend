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

//Function getAjaxGallery
GalleryModel.prototype.getAjaxGallery = function(offset, limit) {
	var scope = this;
	var galleryDeferred = Q.defer(),
		data = {};
	
    if (typeof scope.locale !== "undefined") {
		 Q(hpAdService.getAjaxGallery(scope.requestId, scope.locale, offset, limit))
	    	.then(function (dataReturned) {
	    		data = dataReturned;
	    		galleryDeferred.resolve(data);
			}).fail(function (err) {
				galleryDeferred.reject(new Error(err));
			});
	} else {
		galleryDeferred.resolve(data);
	}
		
    return galleryDeferred.promise;
};

module.exports = GalleryModel;

