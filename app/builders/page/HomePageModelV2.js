'use strict';


var cwd = process.cwd();

var Q = require('q');
var pagetypeJson = require(cwd + '/app/config/pagetype.json');
var ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
var AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let RecentActivityModel = require(cwd + '/app/builders/common/RecentActivityModel');

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getHomepageDataFunctions = function(req, res, modelData) {
	let safetyTipsModel = new SafetyTipsModel(req, res);
	let recentActivityModel = new RecentActivityModel(req, res);

	return {
		'safetyTips': (callback) => {
			let data = safetyTipsModel.getSafetyTips();
			callback(null, data);
		},

		'recentActivities': (callback) => {
			let data = recentActivityModel.getRecentActivities();
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
