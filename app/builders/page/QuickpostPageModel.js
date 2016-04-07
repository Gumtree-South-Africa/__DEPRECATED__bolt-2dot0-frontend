'use strict';


var Q = require('q');

var cwd = process.cwd();
var pagetypeJson = require(cwd + '/app/config/pagetype.json');
var ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
var AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
var config = require('config');


/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getQuickpostDataFunctions = function (req, res) {
	return;
};


/**
 * @description A class that Handles the QuickpostPageModel
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class QuickpostPageModel
 * @constructor
 */
var QuickpostPageModel = function (req, res) {
	var functionMap = getQuickpostDataFunctions(req, res);

	var abstractPageModel = new AbstractPageModel(req, res);
	var pagetype = req.app.locals.pagetype || pagetypeJson.pagetype.PostAdForm;
	var pageModelConfig = abstractPageModel.getPageModelConfig(res, pagetype);

	var arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, pageModelConfig);

	var quickpostModel = new ModelBuilder(arrFunctions);
	var quickpostDeferred = Q.defer();
	Q(quickpostModel.processParallel())
    	.then(function (data) {
    		// Converts the data from an array format to a JSON format
    		// for easy access from the client/controller
    		data = abstractPageModel.convertListToObject(data, arrFunctions);
			quickpostDeferred.resolve(data);
		}).fail(function (err) {
			quickpostDeferred.reject(new Error(err));
		});
	return quickpostDeferred.promise;
};

module.exports = QuickpostPageModel;
