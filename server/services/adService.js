'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class AdService {
	favoriteAd(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.favoriteAd');
		queryEndpoint = queryEndpoint.replace('{id}', adId);

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: queryEndpoint,
		}), bapiHeaderValues, {}, 'adService');
	}

	unfavoriteAd(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.favoriteAd');
		queryEndpoint = queryEndpoint.replace('{id}', adId);

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'DELETE',
			path: queryEndpoint,
		}), bapiHeaderValues, {}, 'adService');
	}
}

module.exports = new AdService();
