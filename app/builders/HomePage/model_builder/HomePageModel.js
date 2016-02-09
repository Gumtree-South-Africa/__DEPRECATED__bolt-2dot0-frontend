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
// var BasePageModel = require("../../common/BasePageModel");
var BasePageModel = require("../../common/ExtendModel");


/**
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var HomePageModel = function (req, res) {
	var bpModel = new BasePageModel(req, res);
	//console.log("***************");
	//console.log(bpModel.getFullName() + " ---> " + bpModel.getAddress());

	var commonData = bpModel.getModelBuilder();

	var loc = new LocationModel(req.requestId, res.config.locale, 2),
		level1Loc = new LocationModel(req.requestId, res.config.locale, 1),
		level2Loc = new LocationModel(req.requestId, res.config.locale, 1),
		cat = new CategoryModel(req.requestId, res.config.locale, 2),
		keyword = new KeywordModel(req.requestId, res.config.locale, 2),
		gallery = new GalleryModel(req.requestId, res.config.locale),
		adstatistics = new AdStatisticsModel(req.requestId, res.config.locale);
	
	var commonDataFunction = function(callback) {
		var commonDataDeferred = Q.defer();
		Q(commonData.processParallel())
	    	.then(function (dataC) {
	    		console.log("Inside commonData from homepageModel");
	    		commonDataDeferred.resolve(dataC);
	    		callback(null, dataC);
			}).fail(function (err) {
				commonDataDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var locationFunction = function(callback) {
		var locationDeferred = Q.defer();
		Q(loc.getLocations())
	    	.then(function (dataL) {
	    		console.log("Inside homepagemodel locations");
	    		locationDeferred.resolve(dataL);
	    		callback(null, dataL);
			}).fail(function (err) {
				locationDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var level1locationFunction = function(callback) {
		var level1locationDeferred = Q.defer();
		Q(level1Loc.getLocations())
	    	.then(function (dataL) {
	    		console.log("Inside homepagemodel level1location");
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
	    		console.log("Inside homepagemodel level2location");
	    		level2locationDeferred.resolve(dataL);
	    		callback(null, dataL);
			}).fail(function (err) {
				level2locationDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var categoryFunction = function(callback) {
		var categoryDeferred = Q.defer();
		Q(cat.processParallel())
	    	.then(function (dataC) {
	    		console.log("Inside homepagemodel categories");
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
	    		statisticsDeferred.resolve(dataS[0]);
	    		callback(null, dataS[0]);
			}).fail(function (err) {
				statisticsDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var arrFunctions = [ commonDataFunction, locationFunction, categoryFunction, keywordsFunction, galleryFunction, statisticsFunction, level1locationFunction, level2locationFunction ];
	var homepageModel = new ModelBuilder(arrFunctions);

	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
    	.then(function (data) {
    		console.log("Inside homepagemodel Combined");
    		homepageDeferred.resolve(data);
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});
	return homepageDeferred.promise;
};

module.exports = HomePageModel;
