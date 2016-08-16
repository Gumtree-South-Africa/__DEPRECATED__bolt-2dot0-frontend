'use strict';

let cwd = process.cwd();
let config = require('config');

let bapiOptionsModel = require(cwd + "/server/services/bapi/bapiOptionsModel");
let bapiService      = require(cwd + "/server/services/bapi/bapiService");

let cacheConfig  = require(cwd + '/server/config/site/cacheConfig.json');
let cacheService = require(cwd + "/server/services/cache/cacheService");


/**
 * Gets data based on the endpoint and parameters passed
 */
class CardService {

	getCardItemsData(bapiHeaderValues, queryEndpoint, parameters) {
		if (parameters) {
			if (parameters.geo) {
				parameters.geo = bapiService.bapiFormatLatLng(parameters.geo);
			}
			// if (parameters.geo === null) {
			// 	// we don't have a location, delete the property to keep it from sending to the back end
			// 	delete parameters.geo;
			// }
		}
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
	 		method: 'GET',
	 		path: config.get(queryEndpoint),
	 		extraParameters: parameters,    // bapiOptionsModel may bring 'parameters' in from config, so we use extraParameters
			timeout: cacheConfig.cache.homepageTrendingCard.bapiTimeout
	 	}), bapiHeaderValues, 'card');
	}

	getTrendingCard(bapiHeaderValues) {
		let parameters = {
			geo: {
				lat: 0.0,
				lng: 0.0
			}
		};
		switch (bapiHeaderValues.locale) {
			case 'es_MX':
				parameters.geo.lat = 23.6345; parameters.geo.lng = 102.5528;
				break;
			default:
				parameters.geo.lat = 0.0; parameters.geo.lng = 0.0;
		}
		return this.getCardItemsData(bapiHeaderValues, 'BAPI.endpoints.trendingSearch', parameters);
	}

	getCachedTrendingCard(bapiHeaderValues) {
		let cachedValue = cacheService.getValue(cacheConfig.cache.homepageTrendingCard.name, bapiHeaderValues.locale);
		return (cachedValue !== undefined) ? cachedValue : {};
	}

}
module.exports = new CardService();
