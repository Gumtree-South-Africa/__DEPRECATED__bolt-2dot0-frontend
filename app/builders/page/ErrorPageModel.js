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

		let initModelData = errorPageModel.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);

		return errorPageModel.resolveAllPromises()
			.then((data) => {
				// Converts the data from an array format to a JSON format
				// for easy access from the client/controller
				data = abstractPageModel.convertListToObject(data, arrFunctions, initModelData);
				return this.mapData(abstractPageModel.getBaseModelData(data), data);
			}).fail((err) => {
				console.error(err);
				console.error(err.stack);
			});
	}

	getErrorpageDataFunctions() {
		return {};
	}

	mapData(modelData, data) {
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.dataLayer = data.common.dataLayer || {};
		modelData.categoryData = this.res.locals.config.categoryflattened;

		return modelData;
	}
}

module.exports = ErrorPageModel;
