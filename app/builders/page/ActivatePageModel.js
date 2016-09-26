'use strict';
let cwd = process.cwd();

let pagetypeJson = require(cwd + '/app/config/pagetype.json');
let ModelBuilder = require(cwd + '/app/builders/common/ModelBuilder');
let SeoModel = require(cwd + '/app/builders/common/SeoModel');
let AuthModel = require(cwd + '/app/builders/common/AuthModel');
let AbstractPageModel = require(cwd + '/app/builders/common/AbstractPageModel');
let _ = require('underscore');

class ActivatePageModel {
	constructor(req, res, activateParams) {
		this.req = req;
		this.res = res;
		this.fullDomainName = res.locals.config.hostname;
		this.baseDomainSuffix = res.locals.config.baseDomainSuffix;
		this.basePort = res.locals.config.basePort;
		this.locale = res.locals.config.locale;
		this.activateParams = activateParams;
	}

	populateData() {
		let abstractPageModel = new AbstractPageModel(this.req, this.res);
		let pagetype = this.req.app.locals.pagetype || pagetypeJson.pagetype.ACTIVATE_PAGE;
		let pageModelConfig = abstractPageModel.getPageModelConfig(this.res, pagetype);
		let modelBuilder = new ModelBuilder(this.getActivatePageData());
		let modelData = modelBuilder.initModelData(this.res.locals, this.req.app.locals, this.req.cookies);
		this.getPageDataFunctions(modelData);
		let arrFunctions = abstractPageModel.getArrFunctionPromises(this.req, this.res, this.dataPromiseFunctionMap, pageModelConfig);
		return modelBuilder.resolveAllPromises(arrFunctions).then((data) => {
			data = abstractPageModel.convertListToObject(data, arrFunctions, modelData);
			this.modelData = this.mapData(abstractPageModel.getBaseModelData(data), data);
			return this.modelData;
		});
	}

	getActivatePageData() {
		return [
			() => {
				return {
					'homePageUrl': this.urlProtocol + 'www.' + this.fullDomainName + this.baseDomainSuffix + this.basePort,
					'languageCode': this.locale,
					'progressBarText': "postAd.confirm.pageTitle"
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
		modelData.activate = data.activate || {};
		modelData.activate.params = this.activateParams;
		return modelData;
	}

	getPageDataFunctions(modelData) {
		let seo = new SeoModel(modelData.bapiHeaders);
		let authModel = new AuthModel(modelData.bapiHeaders);

		this.dataPromiseFunctionMap = {};

		this.dataPromiseFunctionMap.seo = () => {
			return seo.getHPSeoInfo();
		};

		// id we just resent the activation email, no need to call activate
		if (!this.activateParams.resent) {
			this.dataPromiseFunctionMap.activate = () => {
				return authModel.activate(this.activateParams).then((result) => {
					// we map fail cases to failReason codes (R-00, R-10, R-40, R-50) so we can display messages in the hbs if desired
					if (!result.accessToken) {
						console.error(`bapi activate returned success but without the expected access token, signaling fail to consumer`);

						result.failReason = "R-00";
						result.success = false;
					} else {
						result.success = true;
					}
					return result;
				}).fail((err) => {
					let failReason;
					// there should be a status code that indicate activation code expired, want to message to user for that case
					if (err.statusCode === 404) {
						// 404 if user not found
						failReason = "R-40";
					} else {
						// could be anything, lets log it
						console.error(err.message);
						failReason = "R-50";
					}
					return {
						success: false,
						failReason: failReason
					};
				});
			};
		}

	}


}

module.exports = ActivatePageModel;
