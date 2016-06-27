'use strict';


let cwd = process.cwd();

var Q = require('q');
var pagetypeJson = require(cwd + '/app/config/pagetype.json');
var ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
var AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
var SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
var RecentActivityModel = require(cwd + '/app/builders/common/RecentActivityModel');

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
let getHomepageDataFunctions = function(req, res, modelData) {
	let safetyTipsModel = new SafetyTipsModel(req, res);
	let recentActivityModel = new RecentActivityModel(req, res);

	return {
		'safetyTips': (callback) => {
			var data = safetyTipsModel.getSafetyTips();
			callback(null, data);
		},

		'recentActivities': (callback) => {
			var data = recentActivityModel.getRecentActivities();
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
