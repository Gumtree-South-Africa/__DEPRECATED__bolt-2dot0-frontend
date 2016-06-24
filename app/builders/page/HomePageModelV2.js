'use strict';


var cwd = process.cwd();

var Q = require('q');

var pagetypeJson = require(cwd + '/app/config/pagetype.json');

var ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

var AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let CardsModel = require(cwd + '/app/builders/common/CardsModel');

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getHomepageDataFunctions = function(req, res, modelData) {

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

	let safetyTipsModel = new SafetyTipsModel(req, res);
	dataPromiseFunctionMap.safetyTips = (callback) => {
		let data = safetyTipsModel.getSafetyTips();
		callback(null, data);
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

	var arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, pageModelConfig);

	var homepageModel = new ModelBuilder(arrFunctions);

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
