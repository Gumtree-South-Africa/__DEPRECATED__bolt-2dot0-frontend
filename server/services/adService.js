'use strict';

let config = require('config');
let bapiOptionsModel = require('./bapi/bapiOptionsModel');
let ruiOptionsModel = require('./rui/ruiOptionsModel');
let bapiService      = require('./bapi/bapiService');

class AdService {

	viewAd(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '?_expand=category,location,reply-info';
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

	viewAdSellerDetails(bapiHeaderValues, adId) {
		let queryEndpoint = config.get('BAPI.endpoints.specificAd').replace('{id}', adId);
		queryEndpoint = queryEndpoint + '/seller-details';
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdSellerDetails');
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

	viewAdFlags(bapiHeaderValues) {
		let queryEndpoint = config.get('BAPI.endpoints.availableFlagsAd');
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$viewAdFlags');
	}

	searchAds(bapiHeaderValues, searchOptions) {
		let queryEndpoint = config.get('BAPI.endpoints.ads');
		if ((typeof searchOptions !== 'undefined') && (searchOptions !== null)) {
			let excludeAdId = searchOptions.excludeAdId;
			if ((typeof excludeAdId !== 'undefined') && (excludeAdId !== null)) {
				queryEndpoint = queryEndpoint + '?excludeAdId=' + excludeAdId;
			}
		}
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
		}), bapiHeaderValues, 'adService$searchAds');
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

	replyAd(bapiHeaderValues, replyForm) {
		let locale = bapiHeaderValues.locale;
		if (locale === 'es_MX') {
			locale='es_MX_VNS';
		}

		let queryEndpoint = config.get('RUI.endpoints.replyForm') + locale;

		return bapiService.bapiPromisePost(ruiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: queryEndpoint,
			replyHost: replyForm.hostname
		}), bapiHeaderValues, JSON.stringify(replyForm), 'adService$RUI$replyAd');
	}
}

module.exports = new AdService();
