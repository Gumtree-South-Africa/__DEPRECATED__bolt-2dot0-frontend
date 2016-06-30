'use strict';


let cwd = process.cwd();


let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/v2/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/v2/common/AbstractPageModel');
let SafetyTipsModel = require(cwd + '/app/builders/v2/common/SafetyTipsModel');
let AppDownloadModel  = require(cwd + '/app/builders/v2/common/AppDownloadModel');
let RecentActivityModel = require(cwd + '/app/builders/v2/common/RecentActivityModel');


/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
class HomePageModelV2 {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder();
		let modelData = modelBuilder.initModelData(this.res.locals.config, this.req.app.locals, this.req.cookies);

		this.getHomepageDataFunctions(this.res.locals.config, modelData.bapiHeaders);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions)
			.then(function(data) {
				// Converts the data from an array format to a JSON format
				// for easy access from the client/controller
				data = abstractPageModel.convertListToObject(data, arrFunctions);
				return data;
			}).fail(function(err) {
				console.error(err);
				console.error(err.stack);
			});
	}

	getHomepageDataFunctions() {
		let safetyTipsModel = new SafetyTipsModel(this.req, this.res);
		let appDownloadModel = new AppDownloadModel(this.req, this.res);
		let recentActivityModel = new RecentActivityModel(this.req, this.res);
		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.safetyTips = () => {
			return safetyTipsModel.getSafetyTips();
		};
		
		this.dataPromiseFunctionMap.appDownload = () => {
			return appDownloadModel.getAppDownload();
		};

		this.dataPromiseFunctionMap.recentActivities = () => {
			return recentActivityModel.getRecentActivities();
		};
	}
}

module.exports = HomePageModelV2;
