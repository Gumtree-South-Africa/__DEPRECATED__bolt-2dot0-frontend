'use strict';


let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let LocationModel = require(cwd + '/app/builders/common/LocationModel');
let EditAdModel = require(cwd + '/app/builders/common/EditAdModel');
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
		let modelData = modelBuilder.initModelData(this.res.locals.config, this.req.app.locals, this.req.cookies);

		this.getPageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions).then((data) => {
			// Converts the data from an array format to a JSON format
			// for easy access from the client/controller
			data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
			return this.mapData(abstractPageModel.getBaseModelData(data), data);
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
		modelData.dataLayer = data.common.dataLayer || {};
		modelData.categoryData = this.res.locals.config.categoryflattened;
		modelData.seo = data['seo'] || {};
		modelData.adResult.attributeValues = {};
		modelData.adResult.attributes.forEach((attribute) => {
			modelData.adResult.attributeValues[attribute.name] = attribute.value.attributeValue;
		});

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let locationModel = new LocationModel(modelData.bapiHeaders, 1);
		let editAdModel = new EditAdModel(modelData.bapiHeaders);
		modelData.editExtra = editAdModel.translateCustomAttributes();

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.locationlatlong = () => {
			modelData.geoLatLngObj = modelData.geoLatLngObj || '';
			return locationModel.getLocationLatLong(modelData.geoLatLngObj).fail((err) => {
				console.warn(`error getting data ${err}`);
				return {};
			});
		};

		this.dataPromiseFunctionMap.adResult = () => {
			return editAdModel.getAd(this.adId).then((data) => {
				modelData.categoryCurrentHierarchy = [];
				this.getCategoryHierarchy(modelData.category, 0, modelData.categoryCurrentHierarchy);
				return data;
			});
		};
	}
}

module.exports = EditAdPageModel;
