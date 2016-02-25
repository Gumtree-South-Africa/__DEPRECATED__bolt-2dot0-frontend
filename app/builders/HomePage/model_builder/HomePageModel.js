"use strict";

var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("../../common/ModelBuilder");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var KeywordModel = require("../../common/KeywordModel");
var GalleryModel = require("../../common/GalleryModel");
var AdStatisticsModel = require("../../common/AdStatisticsModel");
var SeoModel = require("../../common/SeoModel");
var BasePageModel = require("../../common/ExtendModel");


/**
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var HomePageModel = function (req, res) {
	var bpModel = new BasePageModel(req, res);
	var commonPageData = bpModel.getModelBuilder();

	var level1Loc = new LocationModel(req.requestId, res.locals.config.locale, 1),
		level2Loc = new LocationModel(req.requestId, res.locals.config.locale, 1),
		keyword = (new KeywordModel(req.requestId, res.locals.config.locale, 2)).getModelBuilder(),
		gallery = (new GalleryModel(req.requestId, res.locals.config.locale)).getModelBuilder(),
		adstatistics = (new AdStatisticsModel(req.requestId, res.locals.config.locale)).getModelBuilder(),
		seo = (new SeoModel(req.requestId, res.locals.config.locale)).getModelBuilder();
	
	var commonDataFunction = function(callback) {
		var commonDataDeferred = Q.defer();
		Q(commonPageData.processWaterfall())
	    	.then(function (dataC) {
	    		commonDataDeferred.resolve(dataC);
	    		callback(null, dataC);
			}).fail(function (err) {
				commonDataDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var level1locationFunction = function(callback) {
		var level1locationDeferred = Q.defer();
		Q(level1Loc.getLocations())
	    	.then(function (dataL) {
	    		level1locationDeferred.resolve(dataL);
	    		callback(null, dataL);
			}).fail(function (err) {
				level1locationDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var level2locationFunction = function(callback) {
		var level2locationDeferred = Q.defer();
		Q(level2Loc.getTopL2Locations())
	    	.then(function (dataL) {
	    		level2locationDeferred.resolve(dataL);
	    		callback(null, dataL);
			}).fail(function (err) {
				level2locationDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var keywordsFunction = function(callback) {
		var keywordsDeferred = Q.defer();
		Q(keyword.processParallel())
	    	.then(function (dataK) {
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
	    		statisticsDeferred.resolve(dataS[0]);
	    		callback(null, dataS[0]);
			}).fail(function (err) {
				statisticsDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var seoFunction = function(callback) {
		var seoDeferred = Q.defer();
		Q(seo.processParallel())
	    	.then(function (dataS) {
	    		seoDeferred.resolve(dataS[0]);
	    		callback(null, dataS[0]);
			}).fail(function (err) {
				seoDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var arrFunctions = [ commonDataFunction, keywordsFunction, galleryFunction, statisticsFunction, level1locationFunction, level2locationFunction, seoFunction ];
	var homepageModel = new ModelBuilder(arrFunctions);

	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
    	.then(function (data) {
    		homepageDeferred.resolve(data);
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});
	return homepageDeferred.promise;
};

module.exports = HomePageModel;
