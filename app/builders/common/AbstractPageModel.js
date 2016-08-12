'use strict';

let BasePageModel = require('./BasePageModel');
let deviceDetection = require(process.cwd() + '/modules/device-detection');


/**
 * @description
 * @constructor
 */
class AbstractPageModel extends BasePageModel {
	constructor(req, res) {
		super(req, res);
	}

	getBaseModelData(data) {

		let modelData = {};

		modelData.env = data.env;
		modelData.locale = data.locale;
		modelData.country = data.country;
		modelData.site = data.site;
		modelData.pagename = data.pagename;
		modelData.device = data.device;
		modelData.ip = data.ip;
		modelData.machineid = data.machineid;
		modelData.useragent = data.useragent;

		// Cached Location Data from BAPI
		modelData.location = data.location;
		modelData.locationdropdown = data.locationdropdown;
		modelData.locationIdNameMap = data.locationIdNameMap;

		// Cached Category Data from BAPI
		modelData.category = data.category;
		modelData.categoryDropdown = data.categoryDropdown;

		modelData.categoryIdNameMap = data.categoryIdNameMap;
		modelData.categoryData = data.categoryData;

		// Bapi Header Data
		modelData.bapiHeaders = data.bapiHeaders;

		return modelData;
	}


	/**
	 * @method getPageModelConfig
	 * @description Given a pagetype, looks up bapiConfigData for the bapi calls and
	 *                returns a list of models which determines the list of
	 *                actual bapi calls to make per device per country
	 * @param {Object} response
	 * @param {String} pagetype
	 * @return {JSON}
	 */
	getPageModelConfig(res, pagetype) {
		let bapiConfigData = res.locals.config.bapiConfigData;

		let pageModelConfig = bapiConfigData.bapi[pagetype];

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
	}

	/**
	 * @method getCommonDataFunction
	 * @description Prepares a function which contains common data across all pages
	 * @return {Function}
	 */
	getCommonDataPromises() {
		let commonPageData = this.getModelBuilder();

		let commonDataFunction = () => {
			return commonPageData.resolveAllPromises()
				.then((data) => {
					return data[0];
				});
		};

		commonDataFunction.fnLabel = 'common';
		return commonDataFunction;
	}

	/**
	 * @method getArrFunctions
	 * @description
	 * @param {Object} Request
	 * @param {Object} Response
	 * @param {Map} Map of Page related model labels and respective functions to get their model data
	 * @param {JSON} pageModelConfig for the respective page
	 * @return {Array}
	 */
	getArrFunctionPromises(req, res, functionMap, pageModelConfig) {
		let arrFunctions = [this.getCommonDataPromises(req, res)];

		let index, fnLabel, fn;
		for (index = 0; index < pageModelConfig.length; index++) {
			fnLabel = pageModelConfig[index];
			fn = functionMap[fnLabel];
			if (typeof fn !== 'undefined') {
				fn.fnLabel = fnLabel;
				arrFunctions.push(fn);
			} else {
				// todo: this error occurs when a page is NOT making a call to "locationlatlong",
				// since that call is now conditional (on having a location cookie)
				// we should refactor this so that a conditional api call doesnt flag this as an error
				console.error('Error in loading component ' + fnLabel + ' : not found in ZK config');
			}
		}

		return arrFunctions;
	}

	/**
	 * @method convertListToObject
	 * @description Converts an array with data elements and an array of functions to a JSON
	 *    structure in which the keys are the names of the bapi calls and the values the
	 *    data mapped to that call
	 * @param {Array} dataList Array with the data subsets
	 * @param {Array} arrFunctions Array with the list of bapi calls
	 * @return {JSON}
	 */
	convertListToObject(dataList, arrFunctions, baseObj) {
		let numElems = dataList.length || 0, idx = 0, jsonObj = baseObj || {}, fnLabel = '';
		for (idx = 0; idx < numElems; idx++) {
			fnLabel = arrFunctions[idx].fnLabel;
			if (fnLabel) {
				jsonObj[fnLabel] = dataList[idx];
			}
		}


		return jsonObj;
	}

}

module
	.exports = AbstractPageModel;
