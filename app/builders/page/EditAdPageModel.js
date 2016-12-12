'use strict';


let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let EditAdModel = require(cwd + '/app/builders/common/EditAdModel');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');
let BasePageModel = require(cwd + '/app/builders/common/BasePageModel');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let VerticalCategoryUtil = require(cwd + '/app/utils/VerticalCategoryUtil.js');
let LocationModel = require(cwd + '/app/builders/common/LocationModel');

let _ = require('underscore');

class EditAdPageModel {
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
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.EDIT_AD;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);
		let modelBuilder = new ModelBuilder(this.getEditAdData());
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
			// 2. Ad specific content is ready, now construct the dataLayer
			let basePageModel = new BasePageModel(this.req, this.res);
			basePageModel.setAdResult(data.adResult);
			basePageModel.setCategoryData(data.categoryAll);
			basePageModel.setLocationData(data.locationAll);
			return basePageModel.getModelBuilder().resolveAllPromises();
		}).then((data) => {
			// 3. Setting the dataLayer of modelData after promises resolved, then get out of the whole function
			this.modelData.dataLayer = data[0].dataLayer;
			return this.modelData;
		});
	}

	// Function getPostAdData
	getEditAdData() {
		return [
			() => {
				// initialize
				return {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale,
					'progressBarText': "postAd.confirm.pageTitle"
				};
			}
		];
	}

	/**
	 * a recursive function to return an array of breadcrumb category ids. (eg. [0, 30, 1110])
	 * usage:
	 * let result = []
	 * this.getCategoryHierarchy(modelData.category, 1110, result);
	 * console.log(result)
	 * @param node starts with the whole category tree
	 * @param leafId the leaf you are looking for
	 * @param stack passed by reference array ([0, 30, 1110]), this is your result
	 * @returns {*}
	 */
	getCategoryHierarchy(node, leafId, stack) {
		if (node.id === leafId) {
			stack.unshift(node.id);
			return node.parentId;
		} else {
			for (let i = 0; i < node.children.length; i++) {
				if (node.id === this.getCategoryHierarchy(node.children[i], leafId, stack)) {
					stack.unshift(node.id);
					return node.parentId;
				}
			}
		}
	}

	mapData(modelData, data) {
		modelData = _.extend(modelData, data);
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.category = data.category || {};
		modelData.initialCategory = {suggestion: { categoryId: modelData.adResult.categoryId }} || '';
		modelData.categoryData = this.res.locals.config.categoryflattened;
		modelData.seo = data['seo'] || {};
		modelData.adResult.attributeValues = {};
		modelData.adResult.attributes.forEach((attribute) => {
			modelData.adResult.attributeValues[attribute.name] = attribute.value.attributeValue;
		});

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let editAdModel = new EditAdModel(modelData.bapiHeaders, this.req.app.locals.prodEpsMode);
		let attributeModel = new AttributeModel(modelData.bapiHeaders);
		let locationModel = new LocationModel(modelData.bapiHeaders, 1);

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
					modelData.shouldDefaultPrice = true;
				}
				this.getCategoryHierarchy(modelData.categoryAll, data.categoryId, modelData.categoryCurrentHierarchy);
				return attributeModel.getAllAttributes(data.categoryId).then((attributes) => {
					_.extend(modelData, attributeModel.processCustomAttributesList(attributes, data));

					// Mixin "required" flag for attributes of vertical categories
					let verticalCategory = VerticalCategoryUtil.getVerticalCategory(
						data.categoryId, modelData.categoryAll,
						this.res.locals.config.bapiConfigData.content.verticalCategories);
					if (verticalCategory) {
						modelData.customAttributes = modelData.customAttributes.map(attr => {
							let mixedAttr = {};
							_.extend(mixedAttr, attr);
							mixedAttr.required = verticalCategory.requiredCustomAttributes.indexOf(attr.name) !== -1;
							return mixedAttr;
						});
						modelData.verticalCategory = verticalCategory;
					}

					return data;
				});

			});
		};

		// when we don't have a geoCookie, we shouldn't make the call
		this.dataPromiseFunctionMap.locationlatlong = () => {
			if (modelData.geoLatLngObj === null) {
				return locationModel.getLocationLatLongByIpAddress().then((data) => {
						return {
							lat: data.latitude,
							lon: data.longitude
						};
				}).catch((err) => {
					console.warn(`error getting ip ${err}`);
				});
			}

			return modelData.geoLatLngObj;
		};
	}
}

module.exports = EditAdPageModel;
