'use strict';


let cwd = process.cwd();


let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');

let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');

let SeoModel = require(cwd + '/app/builders/common/SeoModel');


class PostAdPageModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
		this.dataPromiseFunctionMap = {};
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.QUICK_POST_AD_FORM;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);

		let modelBuilder = new ModelBuilder();
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

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getQuickPostSeoInfo();
		};
	}
}

module.exports = PostAdPageModel;
