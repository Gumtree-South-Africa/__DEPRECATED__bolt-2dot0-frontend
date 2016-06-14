'use strict';

var http = require('http');
var Q = require('q');

var ModelBuilder = require('./ModelBuilder');

var seoService = require(process.cwd() + '/server/services/seoService');


/**
 * @description A class that Handles the SEO Model
 * @constructor
 */
var SeoModel = function (bapiHeaders) {
	this.bapiHeaders = bapiHeaders;
};

SeoModel.prototype.getModelBuilder = function () {
	return new ModelBuilder(this.getHPSeoInfo(), this.getQuickPostSeoInfo());
};


// Function getHPSeoInfo
SeoModel.prototype.getHPSeoInfo = function () {

	var seoDeferred = Q.defer();
	var data = {};

	Q(seoService.getHPSeoData(this.bapiHeaders))
		.then(function (dataReturned) {
			data = dataReturned;
			seoDeferred.resolve(data);
		}).fail(function (err) {
		seoDeferred.reject(new Error(err));
	});

	return seoDeferred.promise;
};

// Function getQuickPostSeoInfo
SeoModel.prototype.getQuickPostSeoInfo = function () {

	var seoDeferred = Q.defer();
	var data = {};

	Q(seoService.getQuickPostSeoData(this.bapiHeaders))
		.then(function (dataReturned) {
			data = dataReturned;
			seoDeferred.resolve(data);
		}).fail(function (err) {
		seoDeferred.reject(new Error(err));
	});

	return seoDeferred.promise;
};

module.exports = SeoModel;

