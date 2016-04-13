'use strict';


var cwd = process.cwd();

var Q = require('q');

var pagetypeJson = require(cwd + '/app/config/pagetype.json');

var ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
var LocationModel = require(cwd + '/app/builders/common/LocationModel');
var CategoryModel = require(cwd + '/app/builders/common/CategoryModel');
var KeywordModel = require(cwd + '/app/builders/common/KeywordModel');
var GalleryModel = require(cwd + '/app/builders/common/GalleryModel');
var AdStatisticsModel = require(cwd + '/app/builders/common/AdStatisticsModel');
var SeoModel = require(cwd + '/app/builders/common/SeoModel');
var AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');


function getCookieLocationId(req) {
	var searchLocIdCookieName = 'searchLocId';
	var searchLocIdCookie = req.cookies[searchLocIdCookieName];

	return ((typeof searchLocIdCookie === 'undefined') || searchLocIdCookie === '') ? null : searchLocIdCookie;
}

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getHomepageDataFunctions = function (req, res) {
	var level2Loc = new LocationModel(req.app.locals.requestId, res.locals.config.locale, 1),
		keyword = (new KeywordModel(req.app.locals.requestId, res.locals.config.locale, res.locals.config.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder(),
		gallery = (new GalleryModel(req.app.locals.requestId, res.locals.config.locale)).getModelBuilder(),
		adstatistics = (new AdStatisticsModel(req.app.locals.requestId, res.locals.config.locale)).getModelBuilder(),
		seo = (new SeoModel(req.app.locals.requestId, res.locals.config.locale)).getModelBuilder(),
		category = new CategoryModel(req.app.locals.requestId, res.locals.config.locale, 2, getCookieLocationId(req));
			
	return {
		'level2Loc'		:	function(callback) {
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
		'keyword'		:	function(callback) {
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
		'gallery'		:	function(callback) {
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
		'adstatistics'	:	function(callback) {
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
		'seo'			:	function(callback) {
								var seoDeferred = Q.defer();
								Q(seo.processParallel())
							    	.then(function (dataS) {
							    		seoDeferred.resolve(dataS[0]);
							    		callback(null, dataS[0]);
									}).fail(function (err) {
										seoDeferred.reject(new Error(err));
										callback(null, {});
									});
							},
		'catWithLocId'	:	function(callback) {
								var categoryDeferred = Q.defer();
								Q(category.getCategoriesWithLocId())
									.then(function (dataC) {
										categoryDeferred.resolve(dataC);
										callback(null, dataC);
									}).fail(function (err) {
										categoryDeferred.reject(new Error(err));
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
	var idxCatWithLocId = pageModelConfig.indexOf('catWithLocId');

	if (getCookieLocationId(req) !== null)  {
		if (idxCatWithLocId < 0) {
			pageModelConfig.push('catWithLocId');
		}
	} else if (idxCatWithLocId >= 0) {
		pageModelConfig.splice(idxCatWithLocId, 1);
	}

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
