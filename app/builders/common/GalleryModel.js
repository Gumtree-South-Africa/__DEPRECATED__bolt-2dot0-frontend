"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var hpAdService = require(process.cwd() + "/server/services/homepage-ads");


/** 
 * @description A class that Handles the Gallery Model
 * @constructor
 */
var GalleryModel = function (locale) {
	this.locale = locale;
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
				console.log("Calling AdService for Homepage");
			    
				 Q(hpAdService.getHomepageGallery(scope.locale))
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

