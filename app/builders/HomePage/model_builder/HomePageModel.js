"use strict";


var Q = require("q");

var pagetypeJson = require(process.cwd() + "/app/config/pagetype.json");
var deviceDetection = require(process.cwd() + "/modules/device-detection");

var ModelBuilder = require("../../common/ModelBuilder");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var KeywordModel = require("../../common/KeywordModel");
var GalleryModel = require("../../common/GalleryModel");
var AdStatisticsModel = require("../../common/AdStatisticsModel");
var SeoModel = require("../../common/SeoModel");
var AbstractPageModel = require("../../common/AbstractPageModel");


/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getHomepageDataFunctions = function (req, res) {
	var level2Loc = new LocationModel(req.requestId, res.locals.config.locale, 1), // no for M MX, AR
		keyword = (new KeywordModel(req.requestId, res.locals.config.locale, 2)).getModelBuilder(), // no for M/D US
		gallery = (new GalleryModel(req.requestId, res.locals.config.locale)).getModelBuilder(), // no for M MX, AR
		adstatistics = (new AdStatisticsModel(req.requestId, res.locals.config.locale)).getModelBuilder(), // no for M/D MX, AR
		seo = (new SeoModel(req.requestId, res.locals.config.locale)).getModelBuilder();
			
	return {
		"level2Loc"		:	function(callback) {
								var level2locationDeferred = Q.defer();
								Q(level2Loc.getTopL2Locations())
							    	.then(function (dataL) {
							    		level2locationDeferred.resolve(dataL);
							    		callback(null, dataL);
									}).fail(function (err) {
										level2locationDeferred.reject(new Error(err));
										callback(null, {});
									});
						  	},
		"keyword"		:	function(callback) {
								var keywordsDeferred = Q.defer();
								Q(keyword.processParallel())
							    	.then(function (dataK) {
							    		keywordsDeferred.resolve(dataK);
							    		callback(null, dataK);
									}).fail(function (err) {
										keywordsDeferred.reject(new Error(err));
										callback(null, {});
									});
							},
		"gallery"		:	function(callback) {
								var galleryDeferred = Q.defer();
								Q(gallery.processParallel())
							    	.then(function (dataG) {
							    		galleryDeferred.resolve(dataG[0]);
							    		callback(null, dataG[0]);
									}).fail(function (err) {
										galleryDeferred.reject(new Error(err));
										callback(null, {});
									});
							},
		"adstatistics"	:	function(callback) {
								var statisticsDeferred = Q.defer();
								Q(adstatistics.processParallel())
							    	.then(function (dataS) {
							    		statisticsDeferred.resolve(dataS[0]);
							    		callback(null, dataS[0]);
									}).fail(function (err) {
										statisticsDeferred.reject(new Error(err));
										callback(null, {});
									});
							},
		"seo"			:	function(callback) {
								var seoDeferred = Q.defer();
								Q(seo.processParallel())
							    	.then(function (dataS) {
							    		seoDeferred.resolve(dataS[0]);
							    		callback(null, dataS[0]);
									}).fail(function (err) {
										seoDeferred.reject(new Error(err));
										callback(null, {});
									});
							}						
	};
};


/**
 * @description A class that Handles the HomePage Model
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class HomePageModel
 * @constructor
 */
var HomePageModel = function (req, res) {
	var functionMap = getHomepageDataFunctions(req, res);

	var abstractPageModel = new AbstractPageModel(req, res);
	var pagetype = req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
	var pageModelConfig = abstractPageModel.getPageModelConfig(res, pagetype);
	
	var arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, pageModelConfig);
	
	var homepageModel = new ModelBuilder(arrFunctions);	
	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
    	.then(function (data) {
    		// Converts the data from an array format to a JSON format
    		// for easy access from the client/controller
    		data = abstractPageModel.convertListToObject(data, arrFunctions);
    		homepageDeferred.resolve(data);
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});
	return homepageDeferred.promise;
};

module.exports = HomePageModel;
