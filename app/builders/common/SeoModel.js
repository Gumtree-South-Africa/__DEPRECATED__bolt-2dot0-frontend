'use strict';

let ModelBuilder = require('./ModelBuilder');

let seoService = require(process.cwd() + '/server/services/seo');


/**
 * @description A class that Handles the SEO Model
 * @constructor
 */
class SeoModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getModelBuilder() {
		return new ModelBuilder(this.getHPSeoInfo(), this.getQuickPostSeoInfo());
	}


// Function getHPSeoInfo
	getHPSeoInfo() {
		return seoService.getHPSeoData(this.bapiHeaders);
	}

// Function getQuickPostSeoInfo
	getQuickPostSeoInfo() {
		return seoService.getQuickPostSeoData(this.bapiHeaders);
	}
}

module.exports = SeoModel;

