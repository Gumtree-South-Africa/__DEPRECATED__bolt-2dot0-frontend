'use strict';

let Q = require('q');

let ModelBuilder = require('./ModelBuilder');
let HeaderModel = require('./HeaderModel');
let FooterModel = require('./FooterModel');
let DataLayerModel = require('./DataLayerModel');

/**
 * @description A class that Handles the common models in every page
 * @constructor
 */
class BasePageModel {
	constructor(req, res) {
		this.header = new HeaderModel(req.secure, req, res);
		this.headerBuilder = this.header.getModelBuilder();
		this.footer = new FooterModel(req.secure, req, res);
		this.footerBuilder = this.footer.getModelBuilder();
		this.dataLayer = new DataLayerModel(req, res);
		this.dataLayerBuilder = this.dataLayer.getModelBuilder();
	}

	getModelBuilder() {
		return new ModelBuilder(this.getCommonData());
	}

	getCommonData() {
		return [
			() => {
				return Q.all([
					this.headerBuilder.resolveAllPromises(),
					this.footerBuilder.resolveAllPromises(),
					this.dataLayerBuilder.resolveAllPromises()
				]).then((data) => {
					let combinedData = {
						header: data[0][0],
						footer: data[1][0],
						dataLayer: data[2][0]
					};
					this.dataLayer.setUserId(combinedData.header.id);
					this.dataLayer.setUserEmail(combinedData.header.userEmail);
					return combinedData;
				});
			}
		];
	}
}

module.exports = BasePageModel;

