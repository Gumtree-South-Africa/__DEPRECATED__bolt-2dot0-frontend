'use strict';


let cwd = process.cwd();

let Q = require('q');

let pagetypeJson = require(cwd + '/app/config/pagetype.json');

let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let AppDownloadModel  = require(cwd + '/app/builders/common/AppDownloadModel');

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
let getHomepageDataFunctions = function(req, res) {
	let safetyTipsModel = new SafetyTipsModel(req, res);
	let appDownloadModel = new AppDownloadModel(req, res);

	return {
		'safetyTips': (callback) => {
			let data = safetyTipsModel.getSafetyTips();
			callback(null, data);
		},
		'appDownload': (callback) => {
			 let data = appDownloadModel.getAppDownload();
			 callback(null, data);
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
