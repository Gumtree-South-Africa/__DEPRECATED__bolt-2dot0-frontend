'use strict';


let cwd = process.cwd();
let deviceDetection = require(`${cwd}/modules/device-detection`);
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
let TopCategoriesModel = require(cwd + '/app/builders/common/TopCategoriesModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let AdStatisticsModel = require(cwd + '/app/builders/common/AdStatisticsModel');

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

		let searchLocIdCookieName = 'searchLocId';
		this.searchLocIdCookie = req.cookies[searchLocIdCookieName];
		this.locationdropdown = this.res.locals.config.locationdropdown;

		this.useGeo = false;
		// Check if there is no searchLocIdCookie, then send in lat/long
		if ((typeof this.searchLocIdCookie === 'undefined') || _.isEmpty(this.searchLocIdCookie)) {
			this.useGeo = true;
		} else {
			// Check if searchLocIdCookie is not the root location, then send in lat/long
			if (parseInt(this.searchLocIdCookie) !== this.locationdropdown.id) {
				this.useGeo = true;
			}
		}
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder();
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);

		this.getHomepageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		// register these translations as they are needed for client templating
		abstractPageModel.addToClientTranslation(modelData, [
			"recentactivity.message.listing",
			"recentactivity.message.sold",
			"homepage.trending.contact"
		]);
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
		let showTopBanner = true;

		if (this.bapiConfigData.content.homepageV2) {
			distractionFreeMode = this.bapiConfigData.content.homepageV2.distractionFree || false;
		}

		if (this.bapiConfigData.content.homepageV2.showTopBanner !== undefined) {
			showTopBanner = this.bapiConfigData.content.homepageV2.showTopBanner;
		}

		modelData = _.extend(modelData, data);
		modelData.header = data['common'].header || {};
		modelData.header.distractionFree = distractionFreeMode;
		modelData.footer = data['common'].footer || {};
		modelData.footer.distractionFree = distractionFreeMode;
		modelData.dataLayer = data['common'].dataLayer || {};
		modelData.seo = data['seo'] || {};
		modelData.showTopBanner = showTopBanner;
		modelData.safetyTips.safetyLink = this.bapiConfigData.content.homepageV2.safetyLink;
		modelData.isLocationMobile = deviceDetection.isMobile();

		modelData.isNewHP = true;

		if (data['adstatistics']) {
			modelData.totalLiveAdCount = data['adstatistics'].totalLiveAds || 0;
		}

		return modelData;
	}

	getHomepageDataFunctions(modelData) {

		let safetyTipsModel = new SafetyTipsModel(this.req, this.res);
		let appDownloadModel = new AppDownloadModel(this.req, this.res);
		let topCategoriesModel = new TopCategoriesModel(this.req, this.res);

		let recentActivityModel = new RecentActivityModel(modelData.bapiHeaders, this.req.app.locals.prodEpsMode);
		let cardsModel = new CardsModel(modelData.bapiHeaders, this.req.app.locals.prodEpsMode);
		let cardNames = cardsModel.getCardNamesForPage("homePage");
		let searchModel = new SearchModel(modelData.country, modelData.bapiHeaders);
		let gpsMapModel = new GpsMapModel(modelData.country);
		let locationModel = new LocationModel(modelData.bapiHeaders, 1);
		let keywordModel = (new KeywordModel(modelData.bapiHeaders, this.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder();
		let seo = new SeoModel(modelData.bapiHeaders);
		let adstatistics = (new AdStatisticsModel(modelData.bapiHeaders)).getModelBuilder();

		// now make we get all card data returned for home page
		for (let cardName of cardNames) {
			this.dataPromiseFunctionMap[cardName] = () => {
				// user specific parameters are passed here, such as location lat/long
				let cardParams = {};
				if (cardName === 'trendingCard') {
					cardParams.geo = (this.useGeo === true) ? modelData.geoLatLngObj : null;
				}
				return cardsModel.getCardItemsData(cardName, cardParams).then( (result) => {
					// augment the API result data with some additional card driven config for templates to use
					result.config = cardsModel.getTemplateConfigForCard(cardName);
					return result;
				}).fail((err) => {
					console.warn(`error getting card data ${err}`);
					return {};
				});
			};
		}
		this.dataPromiseFunctionMap.seo = () => {
			return seo.getHPSeoInfo();
		};

		this.dataPromiseFunctionMap.safetyTips = () => {
			return safetyTipsModel.getSafetyTips();
		};

		this.dataPromiseFunctionMap.appDownload = () => {
			return appDownloadModel.getAppDownload();
		};

		this.dataPromiseFunctionMap.recentActivities = () => {
			return recentActivityModel.getRecentActivities((this.useGeo === true) ? modelData.geoLatLngObj : null).then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting recentActivities data ${err}`);
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
				console.warn(`error getting gpsMap data ${err}`);
			});
		};

		this.dataPromiseFunctionMap.topLocations = () => {
			return locationModel.getTopL2Locations().then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting topLocations data ${err}`);
				return {};
			});
		};

		// when we don't have a geoCookie, we shouldn't make the call
		if (modelData.geoLatLngObj) {
			this.dataPromiseFunctionMap.locationlatlong = () => {
				return locationModel.getLocationLatLong(modelData.geoLatLngObj, false).then((data) => {
					return data;
				}).fail((err) => {
					console.warn(`error getting locationlatlong data ${err}`);
					return {};
				});
			};
		}

		this.dataPromiseFunctionMap.topSearches = () => {
			return keywordModel.resolveAllPromises().then((data) => {
				return data[0].keywords || {};
			}).fail((err) => {
				console.warn(`error getting topSearches data ${err}`);
				return {};
			});
		};

		this.dataPromiseFunctionMap.topCategories = () => topCategoriesModel.enabled;

		this.dataPromiseFunctionMap.adstatistics = () => {
			return adstatistics.resolveAllPromises().then((data) => {
				return data[0];
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
	}

}

module.exports = HomePageModelV2;
