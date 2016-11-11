'use strict';

let Q = require('q');

let ModelBuilder = require('./ModelBuilder');
let HeaderModel = require('./HeaderModel');
let HeaderModelV2 = require('./HeaderModelV2');
let FooterModel = require('./FooterModel');
let FooterModelV2 = require('./FooterModelV2');
let DataLayerModel = require('./DataLayerModel');

/**
 * @description A class that Handles the common models in every page
 * @constructor
 */
class BasePageModel {
	constructor(req, res) {
		if (res.locals.b2dot0PageVersion) {
			this.header = new HeaderModelV2(req.secure, req, res);
			this.footer = new FooterModelV2(req.secure, req, res);
		} else {
			this.header = new HeaderModel(req.secure, req, res);
			this.footer = new FooterModel(req.secure, req, res);
		}
		this.headerBuilder = this.header.getModelBuilder();
		this.footerBuilder = this.footer.getModelBuilder();
		this.dataLayer = new DataLayerModel(req, res);
		this.dataLayerBuilder = this.dataLayer.getModelBuilder();
	}

	getModelBuilder() {
		return new ModelBuilder(this.getCommonData());
	}

	setAdResult(adresult) {
		this.dataLayer.setAdResult(adresult);
	}

	setCategoryData(categorydata) {
		this.dataLayer.setCategoryData(categorydata);
	}

	setLocationData(locationdata) {
		this.dataLayer.setLocationData(locationdata);
	}

	getCommonData() {
		return [
			() => {
				let combinedData = {};
				return Q.all([
					this.headerBuilder.resolveAllPromises(),
					this.footerBuilder.resolveAllPromises()
				]).then((data) => {
					combinedData.header = data[0][0];
					combinedData.footer = data[1][0];
					this.dataLayer.setUserId(combinedData.header.id);
					this.dataLayer.setUserEmail(combinedData.header.userEmail);
					this.dataLayer.setUserCreationDate(combinedData.header.creationDate);
					return this.dataLayerBuilder.resolveAllPromises();
				}).then((data) => {
					combinedData.dataLayer = data[0];
					return combinedData;
				});
			}
		];
	}
}

module.exports = BasePageModel;

