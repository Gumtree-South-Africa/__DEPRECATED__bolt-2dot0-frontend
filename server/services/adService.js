'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class AdService {

	viewAd(bapiHeaderValues, adId) {
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: config.get('BAPI.endpoints.specificAd').replace('{id}', adId),
		}), bapiHeaderValues, 'viewAd');
	}

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
