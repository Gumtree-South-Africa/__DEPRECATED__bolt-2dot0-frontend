'use strict';


let cwd = process.cwd();


let pagetypeJson = require(cwd + '/app/config/pagetype.json');

let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let LocationModel = require(cwd + '/app/builders/common/LocationModel');
let CategoryModel = require(cwd + '/app/builders/common/CategoryModel');
let KeywordModel = require(cwd + '/app/builders/common/KeywordModel');
let GalleryModel = require(cwd + '/app/builders/common/GalleryModel');
let AdStatisticsModel = require(cwd + '/app/builders/common/AdStatisticsModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

function getCookieLocationId(req) {
	let searchLocIdCookieName = 'searchLocId';
	let searchLocIdCookie = req.cookies[searchLocIdCookieName];

	return ((typeof searchLocIdCookie === 'undefined') || searchLocIdCookie === '') ? null : searchLocIdCookie;
}

/**
 * @method getHomepageDataFunctions
 * @description Retrieves the list of functions to call to get the model for the Homepage.
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @private
 * @return {JSON}
 */
class HomePageModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.HOMEPAGE;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);
		let idxCatWithLocId = pageModelConfig.indexOf('catWithLocId');

		if (getCookieLocationId(this.req) !== null) {
			if (idxCatWithLocId < 0) {
				pageModelConfig.push('catWithLocId');
			}
		} else if (idxCatWithLocId >= 0) {
			pageModelConfig.splice(idxCatWithLocId, 1);
		}


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
				console.error('Error Building hoe page model');
				console.error(err);
			});
	}

	getHomepageDataFunctions(config, bapiHeaders) {
		let level2Loc = new LocationModel(bapiHeaders, 1);
		let keyword = (new KeywordModel(bapiHeaders, config.bapiConfigData.content.homepage.defaultKeywordsCount)).getModelBuilder();
		let gallery = (new GalleryModel(bapiHeaders)).getModelBuilder();
		let adstatistics = (new AdStatisticsModel(bapiHeaders)).getModelBuilder();
		let seo = new SeoModel(bapiHeaders);
		let category = new CategoryModel(bapiHeaders, 2, getCookieLocationId(this.req));
		this.dataPromiseFunctionMap = {};
		//TODO: why are we calling all functions even if we don't need them

		this.dataPromiseFunctionMap.level2Loc = () => {
			return level2Loc.getTopL2Locations().then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
		this.dataPromiseFunctionMap.seo = seo.getHPSeoInfo();

		this.dataPromiseFunctionMap.adstatistics = () => {
			return adstatistics.resolveAllPromises().then((data) => {
				return data[0];
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
		this.dataPromiseFunctionMap.gallery = () => {
			return gallery.resolveAllPromises().then((data) => {
				return data[0];
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
		this.dataPromiseFunctionMap.keyword = () => {
			return keyword.resolveAllPromises().then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
		this.dataPromiseFunctionMap.catWithLocId = () => {
			return category.getCategoriesWithLocId().then((data) => {
				return data;
			}).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};
	}
}


module.exports = HomePageModel;
