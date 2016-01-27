"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("../../common/ModelBuilder");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var HeaderModel = require("../../common/HeaderModel");
var KeywordModel = require("../../common/KeywordModel");
var GalleryModel = require("../../common/GalleryModel");
var AdStatisticsModel = require("../../common/AdStatisticsModel");
var BasePageModel = require("../../common/BasePageModel");


/**
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var HomePageModel = function (req, res) {
	var headerFunction = BasePageModel.call(this, req, res);
	var loc = new LocationModel(res.config.locale, 2),
		cat = new CategoryModel(res.config.locale, 2),
		keyword = new KeywordModel(res.config.locale, 2),
		gallery = new GalleryModel(res.config.locale),
		adstatistics = new AdStatisticsModel(res.config.locale);

	var locationFunction = function(callback) {
		var locationDeferred = Q.defer();
		Q(loc.processParallel())
	    	.then(function (dataL) {
	    		console.log("Inside homepagemodel locations");
	    		console.dir(dataL);
	    		locationDeferred.resolve(dataL[0]);
	    		callback(null, dataL[0]);
			}).fail(function (err) {
				locationDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var categoryFunction = function(callback) {
		var categoryDeferred = Q.defer();
		Q(cat.processParallel())
	    	.then(function (dataC) {
	    		console.log("Inside homepagemodel categories");
	    		console.dir(dataC);
	    		categoryDeferred.resolve(dataC[0]);
	    		callback(null, dataC[0]);
			}).fail(function (err) {
				categoryDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var keywordsFunction = function(callback) {
		var keywordsDeferred = Q.defer();
		Q(keyword.processParallel())
	    	.then(function (dataK) {
	    		console.log("Inside keyword from homepageModel");
	    		console.dir(dataK);
	    		keywordsDeferred.resolve(dataK);
	    		callback(null, dataK);
			}).fail(function (err) {
				keywordsDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var galleryFunction = function(callback) {
		var galleryDeferred = Q.defer();
		Q(gallery.processParallel())
	    	.then(function (dataG) {
	    		console.log("Inside homepagemodel gallery");
	    		console.dir(dataG);
	    		galleryDeferred.resolve(dataG[0]);
	    		callback(null, dataG[0]);
			}).fail(function (err) {
				galleryDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var statisticsFunction = function(callback) {
		var statisticsDeferred = Q.defer();
		Q(adstatistics.processParallel())
	    	.then(function (dataS) {
	    		console.log("Inside homepagemodel statistics");
	    		console.dir(dataS);
	    		statisticsDeferred.resolve(dataS[0]);
	    		callback(null, dataS[0]);
			}).fail(function (err) {
				statisticsDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var arrFunctions = [ headerFunction, locationFunction, categoryFunction, keywordsFunction, galleryFunction, statisticsFunction ];
	var homepageModel = new ModelBuilder(arrFunctions);

	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
    	.then(function (data) {
    		console.log("Inside homepagemodel Combined");
    		console.dir(data);
    		homepageDeferred.resolve(data);
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});
	return homepageDeferred.promise;
};

module.exports = HomePageModel;
