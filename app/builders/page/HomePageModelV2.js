'use strict';


let cwd = process.cwd();

let Q = require('q');
let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let RecentActivityModel = require(cwd + '/app/builders/common/RecentActivityModel');
let AppDownloadModel  = require(cwd + '/app/builders/common/AppDownloadModel');
let GpsMapModel = require(cwd + '/app/builders/common/GpsMapModel');
let CardsModel = require(cwd + '/app/builders/common/CardsModel');

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
let getHomepageDataFunctions = function(req, res, modelData) {

	/*
	 * Build Component Models
	 */
	let safetyTipsModel = new SafetyTipsModel(req, res);
	let recentActivityModel = new RecentActivityModel(req, res);
	let appDownloadModel = new AppDownloadModel(req, res);
	let gpsMapModel = new GpsMapModel(modelData.bapiHeaders);
	let cardsModel = new CardsModel(modelData.bapiHeaders, modelData.cardsConfig);
	let cardNames = cardsModel.getCardNamesForPage("homePage");

	/*
	 * Build dataPromise function map
	 */
	let dataPromiseFunctionMap = {};

	dataPromiseFunctionMap.safetyTips = (callback) => {
		let data = safetyTipsModel.getSafetyTips();
		callback(null, data);
	};

	dataPromiseFunctionMap.recentActivities = (callback) => {
		let data = recentActivityModel.getRecentActivities();
		callback(null, data);
	};

	dataPromiseFunctionMap.appDownload = (callback) => {
		let data = appDownloadModel.getAppDownload();
		callback(null, data);
	};

	dataPromiseFunctionMap.gpsMap = (callback) => {
		gpsMapModel.getMap({
			location: "[19.414980, -99.177446]"
		}).then((data) => {
			callback(null, data);
		}).fail((err) => {
			console.warn(`error getting data ${err}`);
			callback(null, {});
		});
	};

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

	return dataPromiseFunctionMap;
};


/**
 * @description A class that Handles the HomePage Model
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class HomePageModel
 * @constructor
 */
let HomePageModelV2 = function(req, res, modelData) {
	let functionMap = getHomepageDataFunctions(req, res, modelData);

	let abstractPageModel = new AbstractPageModel(req, res);
	let pagetype = req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
	let pageModelConfig = abstractPageModel.getPageModelConfig(res, pagetype);

	let arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, pageModelConfig);

	let homepageModel = new ModelBuilder(arrFunctions);

	return Q(homepageModel.processParallel())
		.then(function(data) {
			// Converts the data from an array format to a JSON format
			// for easy access from the client/controller
			data = abstractPageModel.convertListToObject(data, arrFunctions);

			return data;
		}).fail(function(err) {
			console.error(err);
			Q.reject(err);
		});
};

module.exports = HomePageModelV2;
