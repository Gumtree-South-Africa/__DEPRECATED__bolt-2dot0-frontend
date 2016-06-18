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
var getHomepageDataFunctions = function(req, res, modelData) {
	// var level2Loc = new LocationModel(modelData.bapiHeaders, 1);
	let keyword = (new KeywordModel(modelData.bapiHeaders, res.locals.config.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder();
	let gallery = (new GalleryModel(modelData.bapiHeaders)).getModelBuilder(); 
	let adstatistics = (new AdStatisticsModel(modelData.bapiHeaders)).getModelBuilder(); 
	let seo = new SeoModel(modelData.bapiHeaders); 
	// let category = new CategoryModel(modelData.bapiHeaders, 2, getCookieLocationId(req));
	
	return {
		'keyword': function(callback) {
			var keywordsDeferred = Q.defer();
			Q(keyword.processParallel())
				.then(function(dataK) {
					keywordsDeferred.resolve(dataK);
					callback(null, dataK);
				}).fail(function(err) {
				keywordsDeferred.reject(new Error(err));
				callback(null, {});
			});
		}, 'gallery': function(callback) {
			var galleryDeferred = Q.defer();
			Q(gallery.processParallel())
				.then(function(dataG) {
					galleryDeferred.resolve(dataG[0]);
					callback(null, dataG[0]);
				}).fail(function(err) {
				galleryDeferred.reject(new Error(err));
				callback(null, {});
			});
		},
		'adstatistics': function(callback) {
			var statisticsDeferred = Q.defer();
			Q(adstatistics.processParallel())
				.then(function(dataS) {
					statisticsDeferred.resolve(dataS[0]);
					callback(null, dataS[0]);
				}).fail(function(err) {
				statisticsDeferred.reject(new Error(err));
				callback(null, {});
			});
		}, 'seo': function(callback) {
			var seoDeferred = Q.defer();
			Q(seo.getHPSeoInfo())
				.then(function(dataS) {
					seoDeferred.resolve(dataS);
					callback(null, dataS);
				}).fail(function(err) {
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
var HomePageModel = function(req, res, modelData) {
	var functionMap = getHomepageDataFunctions(req, res, modelData);

	var abstractPageModel = new AbstractPageModel(req, res);
	var pagetype = req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
	var pageModelConfig = abstractPageModel.getPageModelConfig(res, pagetype);
	var idxCatWithLocId = pageModelConfig.indexOf('catWithLocId');

	if (getCookieLocationId(req) !== null) {
		if (idxCatWithLocId < 0) {
			pageModelConfig.push('catWithLocId');
		}
	} else if (idxCatWithLocId >= 0) {
		pageModelConfig.splice(idxCatWithLocId, 1);
	}

	var arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, pageModelConfig);

	var homepageModel = new ModelBuilder(arrFunctions);
	let i18n = req.i18n;
	return Q(homepageModel.processParallel())
		.then(function(data) {
			// Converts the data from an array format to a JSON format
			// for easy access from the client/controller
			data = abstractPageModel.convertListToObject(data, arrFunctions);

			// Get a copy of the array we can manipulate
			let safetyTips = i18n.__('homepage.safetyTips.tip').slice();
			let i = Math.floor(Math.random() * safetyTips.length);
			let j = Math.floor(Math.random() * safetyTips.length - 1);
			data.safetyTips = {};
			//Splice to remove duplication
			data.safetyTips.one = safetyTips.splice(i, 1)[0];
			data.safetyTips.two = safetyTips.splice(j, 1)[0];
			return data;
		}).fail(function(err) {
			console.error(err);
			Q.reject(err);
	});
};

module.exports = HomePageModel;
