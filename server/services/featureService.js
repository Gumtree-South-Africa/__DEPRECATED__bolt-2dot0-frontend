'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");
let avfQueryPlaceholder = "categoryId={categoryId}&locationId={locationId}&adId={adId}";
class FeatureService {
	getAvailableFeatures(bapiHeaderValues, categoryId, locationId, locale, adId) {
		//return config.get('BAPI.endpoints.adFeatures') + avfQueryPlaceholder.replace('{categoryId}', categoryId).replace('{locationId}', locationId).replace('{adId}', adId);

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: config.get('BAPI.endpoints.adFeatures') + avfQueryPlaceholder.replace('{categoryId}', categoryId).replace('{locationId}', locationId).replace('{adId}', adId),
		}), bapiHeaderValues, 'Features');
	}
}

module.exports = new FeatureService();
