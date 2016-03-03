'use strict';


var Q = require('q');

var ModelBuilder = require('../../common/ModelBuilder');
var AbstractPageModel = require('../../common/AbstractPageModel');

var pagetypeJson = require(process.cwd() + '/app/config/pagetype.json');


/**
 * @method getErrorpageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Errorpage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
var getErrorpageDataFunctions = function (req, res) {
	return {};
};


/**
 * @description A class that Handles the Error Page Model
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @class HomePageModel
 * @constructor
 */
var ErrorPageModel = function (req, res) {
	var functionMap = getErrorpageDataFunctions(req, res);

	var abstractPageModel = new AbstractPageModel(req, res);
	var arrFunctions = abstractPageModel.getArrFunctions(req, res, functionMap, []);
	
	var errorPageModel = new ModelBuilder(arrFunctions);	
	var errorPageDeferred = Q.defer();
	Q(errorPageModel.processParallel())
    	.then(function (data) {
    		// Converts the data from an array format to a JSON format
    		// for easy access from the client/controller
    		data = abstractPageModel.convertListToObject(data, arrFunctions);
    		errorPageDeferred.resolve(data);
		}).fail(function (err) {
			errorPageDeferred.reject(new Error(err));
		});
	return errorPageDeferred.promise;
};

module.exports = ErrorPageModel;
