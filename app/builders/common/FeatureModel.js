'use strict';

let cwd = process.cwd();
let featureService = require(cwd + '/server/services/featureService');

class FeatureModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getAvailableFeatures(categoryId, locationId, locale, adId) {
		return featureService.getAvailableFeatures(this.bapiHeaders, categoryId, locationId, locale, adId);
	}
}

module.exports = FeatureModel;
