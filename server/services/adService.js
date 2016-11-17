'use strict';

let config = require('config');
let bapiOptionsModel = require('./bapi/bapiOptionsModel');
let bapiService      = require('./bapi/bapiService');

class AdService {

	viewAd(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '?_expand=category,location,tracking';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAd');
	}

	viewAdFeatures(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '/features';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdFeatures');
	}

	viewAdStatistics(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '/statistics';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdStatistics');
	}

	viewAdSimilars(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '/similars';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdSimilars');
	}

	viewAdSellerOthers(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '/seller-other-ads';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdSellerOthers');
	}

	viewAdSeoUrls(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '/seo-urls';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdSeoUrls');
	}

	favoriteAd(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.favoriteAd');
		queryEndpoint = queryEndpoint.replace('{id}', adId);

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: queryEndpoint,
		}), bapiHeaderValues, {}, 'adService$favoriteAd');
	}

	unfavoriteAd(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.favoriteAd');
		queryEndpoint = queryEndpoint.replace('{id}', adId);

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'DELETE',
			path: queryEndpoint,
		}), bapiHeaderValues, {}, 'adService$unfavoriteAd');
	}
}

module.exports = new AdService();
