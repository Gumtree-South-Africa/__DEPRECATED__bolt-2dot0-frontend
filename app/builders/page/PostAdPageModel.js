'use strict';


let cwd = process.cwd();

let deviceDetection = require(`${cwd}/modules/device-detection`);
let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

let SeoModel = require(cwd + '/app/builders/common/SeoModel');


class PostAdPageModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;

		this.urlProtocol = this.secure ? 'https://' : 'http://';
		this.fullDomainName = res.locals.config.hostname;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.locale = res.locals.config.locale;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.QUICK_POST_AD_FORM;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder(this.getPostAdData());
		let modelData = modelBuilder.initModelData(this.res.locals.config, this.req.app.locals, this.req.cookies);

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
				let data = {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale
				};

				// add complex data to header
				this.buildCss(data);
			}
		];
	}

	//Build CSS
	buildCss(data) {
		let b2dot0Ver = 'v2';

		data.iconsCSSURLs = [];
		data.iconsCSSFallbackUrl = [];
		data.iconsCSSURLs.push(`${data.baseCSSUrl}${this.locale}/sprite.css`);
		data.iconsCSSFallbackUrl.push(`${data.baseCSSUrl}${this.locale}/${this.locale}.css`);
		data.iconsCSSURLs.push(`${data.baseCSSUrl}${this.locale}/icons.css`);
		data.iconsCSSFallbackUrl.push(`${data.baseCSSUrl}${this.locale}/fallback.css`);

		if (deviceDetection.isMobile()) {
			data.localeCSSPath = data.baseCSSUrl + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
		} else {
			data.localeCSSPath = data.baseCSSUrl + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;
		}
		data.localeCSSPathHack = data.baseCSSUrl + b2dot0Ver + '/' + this.brandName + '/' + this.country + '/' + this.locale;

		data.containerCSS = [];
		if (data.min) {
			data.containerCSS.push(data.localeCSSPath + '/Main.min.css');
		} else {
			data.containerCSS.push(data.localeCSSPath + '/Main.css');
		}
	}

	mapData(modelData, data) {
		modelData.header = data.common.header || {};
		modelData.footer = data.common.footer || {};
		modelData.dataLayer = data.common.dataLayer || {};
		modelData.categoryData = this.res.locals.config.categoryflattened;
		modelData.seo = data['seo'] || {};

		return modelData;
	}

	getPageDataFunctions(modelData) {
		let seo = new SeoModel(modelData.bapiHeaders);
		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getQuickPostSeoInfo();
		};
	}
}

module.exports = PostAdPageModel;
