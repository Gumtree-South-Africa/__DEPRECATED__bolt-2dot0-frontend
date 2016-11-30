'use strict';


let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let EditAdModel = require(cwd + '/app/builders/common/EditAdModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let FeatureModel = require(cwd + '/app/builders/common/FeatureModel');


let _ = require('underscore');

class PromoteAdPageModel {
	constructor(req, res, adId) {
		this.req = req;
		this.res = res;
		this.adId = adId;

		this.urlProtocol = this.secure ? 'https://' : 'http://';
		this.fullDomainName = res.locals.config.hostname;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.locale = res.locals.config.locale;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.AD_PROMOTE_PAGE;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);
		let modelBuilder = new ModelBuilder(this.getPromoteAdData());
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);

		this.getPageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions).then((data) => {
			// Converts the data from an array format to a JSON format
			// for easy access from the client/controller
			data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
			// 1. Save the modelData, don't return the functions since the dataLayer is partially constructed
			this.modelData = this.mapData(abstractPageModel.getBaseModelData(data), data);
			return this.modelData;
		}).then((data) => {
			// 2. After Ad resolved, get available features
			let featureModel = new FeatureModel(modelData.bapiHeaders);
			return featureModel.getAvailableFeatures(data.adResult.categoryId, data.adResult.location.id, data.locale, this.adId);
		}).then((data) => {
			// 3. Set Available Feature to modelData
			this.modelData.features = data;
			return this.modelData;
		});
	}

	getPromoteAdData() {
		return [
			() => {
				// initialize
				return {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale,
					'progressBarText': "promoteAd.confirm.pageTitle"
				};
			}
		];
	}

	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.category = data.category || {};
		modelData.categoryData = this.res.locals.config.categoryflattened;
		modelData.seo = data['seo'] || {};

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let editAdModel = new EditAdModel(modelData.bapiHeaders, this.req.app.locals.prodEpsMode);
		let seo = new SeoModel(modelData.bapiHeaders);
		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getHPSeoInfo();
		};

		this.dataPromiseFunctionMap.adResult = () => {
			return editAdModel.getAd(this.adId).then((data) => {
				modelData.categoryCurrentHierarchy = [];
				// if we have no price or have an unknown currency, default price
				if (!data.price || (data.price.currency !== "MXN" && data.price.currency !== "USD")) {
					data.shouldDefaultPrice = true;
				}
				return data;
			});
		};
	}
}

module.exports = PromoteAdPageModel;
