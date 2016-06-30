'use strict';

let cwd = process.cwd();
let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/v1/common/ModelBuilder');
let AbstractPageModel = require(cwd + '/app/builders/v1/common/AbstractPageModel');
let SeoModel = require(cwd + '/app/builders/v1/common/SeoModel');


class QuickpostPageModel {
	constructor(req, res, modelData) {
		this.req = req;
		this.res = res;
		this.modelData = modelData;
	}

	/**
	 * @description A class that Handles the QuickpostPageModel
	 * @class QuickpostPageModel
	 * @constructor
	 */
	populateData() {
		let functionMap = this.getQuickpostDataFunctions(this.modelData);

		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.QUICK_POST_AD_FORM;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let arrFunctions = abstractPageModel.getArrFunctions(this.req, this.res, functionMap, pageModelConfig);
		let quickpostModel = new ModelBuilder(arrFunctions);
		return quickpostModel.resolveAllPromises()
			.then(function(data) {
				// Converts the data from an array format to a JSON format
				// for easy access from the client/controller
				return abstractPageModel.convertListToObject(data, arrFunctions);
		});
	}

	/**
	 * @method getHomepageDataFunctions
	 * @description Retrieves the list of functions to call to get the model for the Homepage.
	 * @private
	 * @return {JSON}
	 */

	getQuickpostDataFunctions(modelData) {
		let seo = new SeoModel(modelData.bapiHeaders);
		return {
			'seo': function() {
				return seo.getQuickPostSeoInfo()
					.then(function(data) {
						return data;
					}).fail(function(err) {
						console.error(`Error getting Quickpost SEO ${err}`);
						return {};
					});
			}
		};
	}

}

module.exports = QuickpostPageModel;
