'use strict';

var util = require('util');
var Q = require('q');

var BasePageModel = require('./BasePageModel');
var deviceDetection = require(process.cwd() + '/modules/device-detection');


/**
 * @description
 * @constructor
 */
var AbstractPageModel = function (req, res) {
	BasePageModel.call(this, req, res);
};

util.inherits(AbstractPageModel, BasePageModel);


/**
 * @method getPageModelConfig
 * @description Given a pagetype, looks up bapiConfigData for the bapi calls and
 *                returns a list of models which determines the list of
 *                actual bapi calls to make per device per country
 * @param {Object} response
 * @param {String} pagetype
 * @return {JSON}
 */
AbstractPageModel.prototype.getPageModelConfig = function (res, pagetype) {
	var bapiConfigData = res.locals.config.bapiConfigData;

	var pageModelConfig = bapiConfigData.bapi[pagetype];

	if (typeof pageModelConfig !== 'undefined') {
		if (deviceDetection.isMobile()) {
			pageModelConfig = pageModelConfig.mobile.models;
		} else {
			pageModelConfig = pageModelConfig.desktop.models;
		}
	} else {
		pageModelConfig = '';
	}

	return pageModelConfig;
};

/**
 * @method getCommonDataFunction
 * @description Prepares a function which contains common data across all pages
 * @param {Object} Request
 * @param {Object} Response
 * @return {Function}
 */
AbstractPageModel.prototype.getCommonDataFunction = function (req, res) {
	var commonPageData = this.getModelBuilder();

	var commonDataFunction = function (callback) {
		var commonDataDeferred = Q.defer();
		Q(commonPageData.processWaterfall())
			.then(function (dataC) {
				commonDataDeferred.resolve(dataC);
				callback(null, dataC);
			}).fail(function (err) {
			commonDataDeferred.reject(new Error(err));
			callback(null, {});
		});
	};
	commonDataFunction.fnLabel = 'common';

	return commonDataFunction;
};

/**
 * @method getArrFunctions
 * @description
 * @param {Object} Request
 * @param {Object} Response
 * @param {Map} Map of Page related model labels and respective functions to get their model data
 * @param {JSON} pageModelConfig for the respective page
 * @return {Array}
 */
AbstractPageModel.prototype.getArrFunctions = function (req, res, functionMap, pageModelConfig) {
	var arrFunctions = [this.getCommonDataFunction(req, res)];

	var index, fnLabel, fn;
	for (index = 0; index < pageModelConfig.length; index++) {
		fnLabel = pageModelConfig[index];
		fn = functionMap[fnLabel];
		fn.fnLabel = fnLabel;
		arrFunctions.push(fn);
	}

	return arrFunctions;
};

/**
 * @method convertListToObject
 * @description Converts an array with data elements and an array of functions to a JSON
 *    structure in which the keys are the names of the bapi calls and the values the
 *    data mapped to that call
 * @param {Array} dataList Array with the data subsets
 * @param {Array} arrFunctions Array with the list of bapi calls
 * @return {JSON}
 */
AbstractPageModel.prototype.convertListToObject = function (dataList, arrFunctions) {
	var numElems = dataList.length || 0,
		idx = 0,
		jsonObj = {},
		fnLabel = '';
	for (idx = 0; idx < numElems; idx++) {
		fnLabel = arrFunctions[idx].fnLabel;
		if (fnLabel) {
			jsonObj[fnLabel] = dataList[idx];
		}
	}

	return jsonObj;
};

module.exports = AbstractPageModel;

