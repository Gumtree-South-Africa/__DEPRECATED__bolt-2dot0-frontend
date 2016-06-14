'use strict';

var http = require('http');
var Q = require('q');

var ModelBuilder = require('./ModelBuilder');

var hpAdService = require(process.cwd() + '/server/services/homepageAdService');


/**
 * @description A class that Handles the Gallery Model
 * @constructor
 */
var GalleryModel = function (bapiHeaders) {
	this.bapiHeaders = bapiHeaders;
};

GalleryModel.prototype.getModelBuilder = function () {
	return new ModelBuilder(this.getHomePageGallery());
};

// Function getHomePageGallery
GalleryModel.prototype.getHomePageGallery = function () {
	var _this = this;
	var arrFunctions = [
		function (callback) {
			var galleryDeferred,
				data = {};
			if (typeof callback !== 'function') {
				return;
			}

			if (typeof _this.bapiHeaders.locale !== 'undefined') {
				galleryDeferred = Q.defer();

				Q(hpAdService.getHomepageGallery(_this.bapiHeaders))
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
GalleryModel.prototype.getAjaxGallery = function (offset, limit) {

	var galleryDeferred = Q.defer(),
		data = {};

	if (typeof this.bapiHeaders.locale !== 'undefined') {
		Q(hpAdService.getAjaxGallery(this.bapiHeaders, offset, limit))
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

