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
let KeywordModel= require(cwd + '/app/builders/common/KeywordModel');
let LocationModel = require(cwd + '/app/builders/common/LocationModel');

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
		this.bapiConfigData = this.res.locals.config.bapiConfigData;
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
		let distractionFreeMode = false;
		if (this.bapiConfigData.content.homepageV2) {
			distractionFreeMode = this.bapiConfigData.content.homepageV2.distractionFree || false;
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

		let recentActivityModel = new RecentActivityModel(modelData.bapiHeaders);
		let cardsModel = new CardsModel(modelData.bapiHeaders, modelData.cardsConfig);
		let cardNames = cardsModel.getCardNamesForPage("homePage");
		let searchModel = new SearchModel(modelData.country, modelData.bapiHeaders);
		let gpsMapModel = new GpsMapModel(modelData.country);
		let locationModel = new LocationModel(modelData.bapiHeaders, 1);
		let keywordModel = (new KeywordModel(modelData.bapiHeaders, this.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder();

		// now make we get all card data returned for home page
		for (let cardName of cardNames) {
			this.dataPromiseFunctionMap[cardName] = () => {
				// user specific parameters are passed here, such as location lat/long
				// temporary - use MEXICO CITY Latitude	19.432608 Longitude	-99.133209, using the syntaxt the api needs
				return cardsModel.getCardItemsData(cardName, {
					geo: modelData.geoLatLng
				}).then( (result) => {
					// augment the API result data with some additional card driven config for templates to use
					result.config = cardsModel.getTemplateConfigForCard(cardName);
					return result;
				}).fail((err) => {
					console.warn(`error getting data ${err}`);
					return {};
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
			return recentActivityModel.getRecentActivities(modelData.geoLatLng).then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
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

		this.dataPromiseFunctionMap.topLocations = () => {
			return locationModel.getTopL2Locations().then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};

		// when we don't have a geoCookie, we shouldn't make the call
		if (modelData.geoLatLngObj) {
			this.dataPromiseFunctionMap.locationlatlong = () => {
				return locationModel.getLocationLatLong(modelData.geoCookie).then((data) => {
					return data;
				}).fail((err) => {
					console.warn(`error getting data ${err}`);
					return {};
				});
			};
		}

		this.dataPromiseFunctionMap.topSearches = () => {
			return keywordModel.resolveAllPromises().then((data) => {
				return data[0].keywords || {};
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
	}
}

module.exports = HomePageModelV2;
