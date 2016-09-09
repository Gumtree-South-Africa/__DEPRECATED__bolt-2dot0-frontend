'use strict';

let ModelBuilder = require(process.cwd() + '/app/builders/common/ModelBuilder');
let AbstractPageModel = require(process.cwd() + '/app/builders/common/AbstractPageModel');


class ErrorPageModel {

	constructor(req, res) {
		this.req = req;
		this.res = res;
	}
	/**

	 * @description A class that Handles the Error Page Model
	 * @param {Object} req Request object
	 * @param {Object} res Response object
	 * @class HomePageModel
	 * @constructor
	 */
	populateData() {
		let functionMap = this.getErrorpageDataFunctions();

		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, functionMap, []);

		let errorPageModel = new ModelBuilder(arrFunctions);
		return errorPageModel.resolveAllPromises()
			.then(function(data) {
				// Converts the data from an array format to a JSON format
				// for easy access from the client/controller
				return abstractPageModel.convertListToObject(data, arrFunctions);
			});
	}

	getErrorpageDataFunctions() {
		return {};
	}
}

module.exports = ErrorPageModel;
