'use strict';


let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let ImageRecognitionModel = require(cwd + '/app/builders/common/ImageRecognitionModel');
let logger = require(`${cwd}/server/utils/logger`);

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
		let initialImage = decodeURIComponent(req.cookies['initialImage'] || '');
		if (initialImage === INVALID_COOKIE_VALUE) {
			initialImage = '';
		} else {
			res.cookie('initialImage', INVALID_COOKIE_VALUE);
		}
		modelData.initialImage = initialImage;
		let backUrl = decodeURIComponent(req.cookies['backUrl'] || '');
		if (backUrl === INVALID_COOKIE_VALUE) {
			backUrl = '';
		} else {
			res.cookie('backUrl', INVALID_COOKIE_VALUE);
		}
		modelData.backUrl = backUrl;
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
		modelData.deferredAd = data.deferredAd;
		modelData.header = data.common.header || {};
		modelData.header.canonical = modelData.header.canonical + "/post";
		modelData.footer = data.common.footer || {};
		modelData.dataLayer = data.common.dataLayer || {};
		modelData.categoryData = this.res.locals.config.categoryflattened;
		modelData.seo = data['seo'] || {};

		modelData.initialCategory = data['initialCategory'] || '';

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let seo = new SeoModel(modelData.bapiHeaders);
		let imageRecognitionModel = new ImageRecognitionModel(modelData.bapiHeaders);
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

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getPostSeoInfo();
		};
	}
}

module.exports = PostAdPageModel;
