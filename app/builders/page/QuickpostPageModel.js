'use strict';


var Q = require('q');

var config = require('config');

var cwd = process.cwd();
var pagetypeJson = require(cwd + '/app/config/pagetype.json');
var ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
var AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
var SeoModel = require(cwd + '/app/builders/common/SeoModel');


/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getQuickpostDataFunctions = function (req, res, modelData) {
	var seo = new SeoModel(modelData.bapiHeaders);
	return {
		'seo'	:	function(callback) {
						var seoDeferred = Q.defer();
						Q(seo.getQuickPostSeoInfo())
							.then(function (dataS) {
								seoDeferred.resolve(dataS);
								callback(null, dataS);
							}).fail(function (err) {
								seoDeferred.reject(new Error(err));
								callback(null, {});
							});
					}
	};
};


/**
 * @description A class that Handles the QuickpostPageModel
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class QuickpostPageModel
 * @constructor
 */
var QuickpostPageModel = function (req, res, modelData) {
	var functionMap = getQuickpostDataFunctions(req, res, modelData);

	var abstractPageModel = new AbstractPageModel(req, res);
	var pagetype = req.app.locals.pagetype || pagetypeJson.pagetype.QUICK_POST_AD_FORM;
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
