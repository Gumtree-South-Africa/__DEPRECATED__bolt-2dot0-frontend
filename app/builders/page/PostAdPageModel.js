'use strict';


let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let AttributeModel = require(cwd + '/app/builders/common/AttributeModel.js');
let VerticalCategoryUtil = require(cwd + '/app/utils/VerticalCategoryUtil.js');

let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let ImageRecognitionModel = require(cwd + '/app/builders/common/ImageRecognitionModel');
let logger = require(`${cwd}/server/utils/logger`);
let Q = require('q');
let _ = require('underscore');

const INVALID_COOKIE_VALUE = 'invalid';

class PostAdPageModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;

		//this.urlProtocol = this.secure ? 'https://' : 'http://';
		this.urlProtocol = 'https://';
		this.fullDomainName = res.locals.config.hostname;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.locale = res.locals.config.locale;
	}

	populateData(deferredAd) {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.POST_AD;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);
		let modelBuilder = new ModelBuilder(this.getPostAdData());
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);
		modelData.deferredAd = deferredAd;
		let initialImage = decodeURIComponent(this.req.cookies['initialImage'] || '');
		if (initialImage === INVALID_COOKIE_VALUE) {
			initialImage = '';
		}
		modelData.initialImage = initialImage;
		let backUrl = decodeURIComponent(this.req.cookies['backUrl'] || '');
		if (backUrl === INVALID_COOKIE_VALUE) {
			backUrl = '';
		}
		modelData.backUrl = backUrl;
		abstractPageModel.addToClientTranslation(modelData, [
			"feature"
		]);
		this.getPageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions).then((data) => {
			// Converts the data from an array format to a JSON format
			// for easy access from the client/controller
			data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
			return this.mapData(abstractPageModel.getBaseModelData(data), data);
		}).fail((err) => {
			console.error(err);
			console.error(err.stack);
		});
	}

	// Function getPostAdData
	getPostAdData() {
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

	mapData(modelData, data) {
		modelData.clientTranslations = data.clientTranslations;
		modelData.deferredAd = data.deferredAd;
		modelData.header = data.common.header || {};
		modelData.header.canonical = modelData.header.canonical + "/post";
		modelData.footer = data.common.footer || {};
		modelData.dataLayer = data.common.dataLayer || {};
		modelData.categoryData = this.res.locals.config.categoryflattened;
		modelData.seo = data['seo'] || {};

		modelData.initialCategory = data['initialCategory'] || '';
		modelData.initialImage = data.initialImage;
		modelData.backUrl = data.backUrl;
		if (data.adDraft) {
			modelData.adResult = data.adDraft;
			// Make structure consistent with edit page to share rendering logic
			modelData.adResult.attributeValues = {};
			modelData.adResult.attributes.forEach((attribute) => {
				modelData.adResult.attributeValues[attribute.name] = attribute.value.attributeValue;
			});
			modelData.isPriceExcluded = data.isPriceExcluded;
			modelData.customAttributes = data.customAttributes;
			modelData.verticalCategory = data.verticalCategory;
			modelData.categoryCurrentHierarchy = data.categoryCurrentHierarchy;
			modelData.shouldDefaultPrice = data.shouldDefaultPrice;
			if (data.adDraft.categoryId !== null && data.adDraft.categoryId !== undefined) {
				modelData.initialCategory = { suggestion: { categoryId: data.adDraft.categoryId } };
			}

			if (modelData.adResult.pictures && modelData.adResult.pictures.sizeUrls.length === 1) {
				modelData.initialImage = modelData.adResult.pictures.sizeUrls[0].LARGE;
			}
		} else {
			modelData.shouldDefaultPrice = true;
		}
		return modelData;
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

	getPageDataFunctions(modelData) {
		let seo = new SeoModel(modelData.bapiHeaders);
		let imageRecognitionModel = new ImageRecognitionModel(modelData.bapiHeaders);
		let attributeModel = new AttributeModel(modelData.bapiHeaders);
		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.initialCategory = () => {
			if (modelData.initialImage !== '') {
				return imageRecognitionModel.recognizeCategoryFromImage(modelData.initialImage).fail(err => {
					console.error(
						"[API Image recognition] Did not recognize a category for the image, set default to Hogar !");
					logger.logError(err);
					return {
						suggestion: { categoryId: 1 }
					};
				});
			} else {
				return {"suggestion": {"categoryId": ""}};
			}
		};

		this.dataPromiseFunctionMap.adDraft = () => {
			if (!modelData.deferredAd || !modelData.deferredAd.ads || !modelData.deferredAd.ads.length) {
				return Q.resolve(null);
			}
			let data = modelData.deferredAd.ads[0];

			// if we have no price or have an unknown currency, default price
			if (!data.price || (data.price.currency !== "MXN" && data.price.currency !== "USD")) {
				modelData.shouldDefaultPrice = true;
			}

			if (data.imageUrls) {
				data.pictures = {
					sizeUrls: data.imageUrls.map(imageUrl => {
						return { LARGE: imageUrl };
					})
				};
			}

			if (data.categoryId === null || data.categoryId === undefined) {
				return Q.resolve(data);
			}

			if (data.categoryAttributes) {
				data.attributes = data.categoryAttributes.map(attribute => {
					return { name: attribute.name, value: { attributeValue: attribute.value } };
				});
			}

			modelData.categoryCurrentHierarchy = [];
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
		};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getPostSeoInfo();
		};
	}
}

module.exports = PostAdPageModel;
