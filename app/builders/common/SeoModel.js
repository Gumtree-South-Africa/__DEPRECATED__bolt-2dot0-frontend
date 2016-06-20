'use strict';

let Q = require('q');

let ModelBuilder = require('./ModelBuilder');

let seoService = require(process.cwd() + '/server/services/seo');


/**
 * @description A class that Handles the SEO Model
 * @constructor
 */
let SeoModel = function(bapiHeaders) {
	this.bapiHeaders = bapiHeaders;
};

SeoModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getHPSeoInfo(), this.getQuickPostSeoInfo());
};


// Function getHPSeoInfo
SeoModel.prototype.getHPSeoInfo = function() {

	let seoDeferred = Q.defer();
	let data = {};

	Q(seoService.getHPSeoData(this.bapiHeaders))
		.then(function(dataReturned) {
			data = dataReturned;
			seoDeferred.resolve(data);
		}).fail(function(err) {
		seoDeferred.reject(new Error(err));
	});

	return seoDeferred.promise;
};

// Function getQuickPostSeoInfo
SeoModel.prototype.getQuickPostSeoInfo = function() {

	let seoDeferred = Q.defer();
	let data = {};

	Q(seoService.getQuickPostSeoData(this.bapiHeaders))
		.then(function(dataReturned) {
			data = dataReturned;
			seoDeferred.resolve(data);
		}).fail(function(err) {
		seoDeferred.reject(new Error(err));
	});

	return seoDeferred.promise;
};

module.exports = SeoModel;

