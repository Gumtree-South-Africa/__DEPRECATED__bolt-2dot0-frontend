'use strict';


let cwd = process.cwd();

let _ = require("underscore");

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let SafetyTipsModel = require(cwd + '/app/builders/common/SafetyTipsModel');
let AppDownloadModel  = require(cwd + '/app/builders/common/AppDownloadModel');
let GpsMapModel = require(cwd + '/app/builders/common/GpsMapModel');
let RecentActivityModel = require(cwd + '/app/builders/common/RecentActivityModel');
let CardsModel = require(cwd + '/app/builders/common/CardsModel');
let SearchModel = require(cwd + '/app/builders/common/SearchModel');

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
		this.dataPromiseFunctionMap = {};
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder();
		let modelData = modelBuilder.initModelData(this.res.locals.config, this.req.app.locals, this.req.cookies);

		this.getHomepageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions)
			.then((data) => {
				// Converts the data from an array format to a JSON format
				// for easy access from the client/controller
				data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
				return this.mapData(abstractPageModel.getBaseModelData(data), data);
			}).fail((err) => {
				console.error(err);
				console.error(err.stack);
			});
	}

	mapData(modelData, data) {
		let bapiConfigData = this.res.locals.config.bapiConfigData;
		let distractionFreeMode = false;
		if (bapiConfigData.content.homepageV2) {
			distractionFreeMode = bapiConfigData.content.homepageV2.distractionFree || false;
		}
		modelData = _.extend(modelData, data);
		modelData.header = data['common'].header || {};
		modelData.header.distractionFree = distractionFreeMode;
		modelData.footer = data['common'].footer || {};
		modelData.footer.distractionFree = distractionFreeMode;
		modelData.dataLayer = data['common'].dataLayer || {};
		modelData.seo = data['seo'] || {};

		modelData.isNewHP = true;

		return modelData;
	}

	getHomepageDataFunctions(modelData) {
		let safetyTipsModel = new SafetyTipsModel(this.req, this.res);
		let appDownloadModel = new AppDownloadModel(this.req, this.res);
		let recentActivityModel = new RecentActivityModel(this.req, this.res);

		let cardsModel = new CardsModel(modelData.bapiHeaders, modelData.cardsConfig);
		let cardNames = cardsModel.getCardNamesForPage("homePage");
		let searchModel = new SearchModel(modelData.bapiHeaders);
		let gpsMapModel = new GpsMapModel(modelData.country);

		// now make we get all card data returned for home page
		for (let cardName of cardNames) {
			this.dataPromiseFunctionMap[cardName] = () => {
				// user specific parameters are passed here, such as location lat/long
				// temporary - use MEXICO CITY Latitude	19.432608 Longitude	-99.133209, using the syntaxt the api needs
				return cardsModel.getCardItemsData(cardName, {
					location: "(40.12,-71.34),(70.12,-73.34)"
				}).then( (result) => {
					// augment the API result data with some additional card driven config for templates to use
					result.config = cardsModel.getTemplateConfigForCard(cardName);
					return result;
				});
			};
		}

		this.dataPromiseFunctionMap.safetyTips = () => {
			return safetyTipsModel.getSafetyTips();
		};

		this.dataPromiseFunctionMap.appDownload = () => {
			return appDownloadModel.getAppDownload();
		};

		this.dataPromiseFunctionMap.recentActivities = () => {
			return recentActivityModel.getRecentActivities();
		};

		this.dataPromiseFunctionMap.search = () => {
			return searchModel.getSearch();
		};

		this.dataPromiseFunctionMap.gpsMap = () => {
			return gpsMapModel.getMap({
				location: [19.414980,-99.177446]
			}).then((data) => {
				data.totalAds = data.response.numFound;
				data.facet = data.facet_counts.facet_pivot['Address.geolocation_p100_0_coordinate,Address.geolocation_p100_1_coordinate'];
				return data;
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
			});
		};
	}
}

module.exports = HomePageModelV2;
