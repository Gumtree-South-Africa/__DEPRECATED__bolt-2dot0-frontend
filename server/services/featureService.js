'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");
class FeatureService {
	getAvailableFeatures(bapiHeaderValues, categoryId, locationId, adId) {
		let queryParameter = "";
		if (categoryId) {
			queryParameter += "categoryId=" + categoryId;
		}

		if (locationId) {
			queryParameter += (queryParameter ? "&locationId=" : "locationId=") + locationId;
		}

		if (adId) {
			queryParameter += (queryParameter ? "&adId=" : "adId=") + adId;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: config.get('BAPI.endpoints.adFeatures') + queryParameter,
		}), bapiHeaderValues, 'Features');
	}
}

module.exports = new FeatureService();
