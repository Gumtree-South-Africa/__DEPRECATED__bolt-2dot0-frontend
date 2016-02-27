"use strict";

var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var pagetypeJson = require(process.cwd() + "/app/config/pagetype.json");
var deviceDetection = require(process.cwd() + "/modules/device-detection");

var ModelBuilder = require("../../common/ModelBuilder");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var KeywordModel = require("../../common/KeywordModel");
var GalleryModel = require("../../common/GalleryModel");
var AdStatisticsModel = require("../../common/AdStatisticsModel");
var SeoModel = require("../../common/SeoModel");
var BasePageModel = require("../../common/ExtendModel");


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
							},
		"NA"			:	function(callback) {
								var naDeferred = Q.defer();
								naDeferred.resolve({});
								callback(null, {});
							}							
	};
};



/*
 ********************* TODO: move to Abstract Page Model BEGIN *********************
 */ 

function getPageModelConfig(res, pagetype) {
	var bapiConfigData = res.locals.config.bapiConfigData;
	
	var pageModelConfig = bapiConfigData.bapi[pagetype];
	if (deviceDetection.isMobile()) {
		pageModelConfig = pageModelConfig.mobile.models;
	} else {
		pageModelConfig = pageModelConfig.desktop.models;
	}
	
	return pageModelConfig;
}

function getCommonDataFunction(req, res) {
	var bpModel = new BasePageModel(req, res);
	
	var commonPageData = bpModel.getModelBuilder();

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
	commonDataFunction.fnLabel = "common";
	
	return commonDataFunction;
}

function getArrFunctions(req, res, functionMap, pageModelConfig) {
	var arrFunctions = [ getCommonDataFunction(req, res) ];
	
	var index, fnLabel, fn;
	for (index=0; index<pageModelConfig.length; index++) {
		fnLabel = pageModelConfig[index];
		fn = functionMap[fnLabel];
		fn.fnLabel = fnLabel;
		arrFunctions.push(fn);
	}
	
	return arrFunctions;
}

/**
 * @method convertListToObject
 * @description Converts an array with data elements and an array of functions to a JSON
 *    structure in which the keys are the names of the bapi calls and the values the
 *    data mapped to that call
 * @param {Array} dataList Array with the data subsets
 * @param {Array} arrFunctions Array with the list of bapi calls
 * @private
 * @return {JSON}
 */
function convertListToObject (dataList, arrFunctions) {
	var numElems = dataList.length || 0,
		idx = 0,
		jsonObj = {},
		fnLabel = "";
	for (idx=0; idx < numElems; idx++) {
		fnLabel = arrFunctions[idx].fnLabel;
		if (fnLabel) {
			jsonObj[fnLabel] = dataList[idx];
		}
	}

	return jsonObj;
}

/*
 ********************* TODO: move to Abstract Page Model END  *********************
 */ 




/**
 * @description A class that Handles the HomePage Model
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class HomePageModel
 * @constructor
 */
var HomePageModel = function (req, res) {
	var functionMap = getHomepageDataFunctions(req, res);

	var pagetype = req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
	var pageModelConfig = getPageModelConfig(res, pagetype);
	
	var arrFunctions = getArrFunctions(req, res, functionMap, pageModelConfig);
	
	var homepageModel = new ModelBuilder(arrFunctions);	
	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
    	.then(function (data) {
    		// Converts the data from an array format to a JSON format
    		// for easy access from the client/controller
    		data = convertListToObject(data, arrFunctions);
    		homepageDeferred.resolve(data);
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});
	return homepageDeferred.promise;
};

module.exports = HomePageModel;
