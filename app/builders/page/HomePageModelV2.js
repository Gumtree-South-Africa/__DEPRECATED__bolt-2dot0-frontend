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
var CardsModel = require(cwd + '/app/builders/common/CardsModel');

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
	let level2Loc = new LocationModel(modelData.bapiHeaders, 1);
	let keyword = (new KeywordModel(modelData.bapiHeaders, res.locals.config.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder();
	let gallery = (new GalleryModel(modelData.bapiHeaders)).getModelBuilder();
	let adstatistics = (new AdStatisticsModel(modelData.bapiHeaders)).getModelBuilder();
	let seo = new SeoModel(modelData.bapiHeaders);
	let category = new CategoryModel(modelData.bapiHeaders, 2, getCookieLocationId(req));

	let cardsModel = new CardsModel(modelData.bapiHeaders, modelData.cardsConfig);
	let cardNames = cardsModel.getCardNamesForPage("homePage");
	let dataPromiseFunctionMap = {};

	for (let cardName of cardNames) {
		dataPromiseFunctionMap[cardName] = (callback) => {
			// user specific parameters are passed here, such as location lat/long
			// temporary - use MEXICO CITY Latitude	19.432608 Longitude	-99.133209, using the syntaxt the api needs
			cardsModel.getCardItemsData(cardName, {
				location: "[19.432608, -99.133209]"
			}).then((dataL) => {
				callback(null, dataL);
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				callback(null, {});
			});
		};
	}

	dataPromiseFunctionMap.catWithLocId = (callback) => {
		level2Loc.getTopL2Locations().then((dataL) => {
			callback(null, dataL);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};
	dataPromiseFunctionMap.seo = (callback) => {
		seo.getHPSeoInfo().then((dataL) => {
			callback(null, dataL);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};
	dataPromiseFunctionMap.adstatistics = (callback) => {
		adstatistics.processParallel().then((dataL) => {
			callback(null, dataL[0]);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};
	dataPromiseFunctionMap.gallery = (callback) => {
		gallery.processParallel().then((dataL) => {
			callback(null, dataL[0]);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};
	dataPromiseFunctionMap.keyword = (callback) => {
		keyword.processParallel().then((dataL) => {
			callback(null, dataL);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};
	dataPromiseFunctionMap.level2Loc = (callback) => {
		level2Loc.getTopL2Locations().then((dataL) => {
			callback(null, dataL);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};
	return dataPromiseFunctionMap;
};


/**
 * @description A class that Handles the HomePage Model
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class HomePageModel
 * @constructor
 */
var HomePageModelV2 = function(req, res, modelData) {
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
	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
		.then(function(data) {
			// Converts the data from an array format to a JSON format
			// for easy access from the client/controller
			data = abstractPageModel.convertListToObject(data, arrFunctions);
			homepageDeferred.resolve(data);
		}).fail(function(err) {
		homepageDeferred.reject(new Error(err));
	});
	return homepageDeferred.promise;
};

module.exports = HomePageModelV2;
