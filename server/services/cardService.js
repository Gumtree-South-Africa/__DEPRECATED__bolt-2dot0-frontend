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

	getCardItemsData(bapiHeaderValues, queryEndpoint, parameters, cardName) {
		// console.log(parameters);

		if (parameters) {
			if (parameters.geo === null) {
				// we don't have a location, delete the property to keep it from sending to the back end
				delete parameters.geo;
			} else if (parameters.geo) {
				parameters.geo = bapiService.bapiFormatLatLng(parameters.geo);
			}
		}
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
	 		method: 'GET',
	 		path: config.get(queryEndpoint),
	 		extraParameters: parameters,    // bapiOptionsModel may bring 'parameters' in from config, so we use extraParameters
			timeout: cacheConfig.cache.homepageTrendingCard.bapiTimeout
	 	}), bapiHeaderValues, cardName);
	}

	// NOTE: this is only called by the cache, specific to trending
	getTrendingCard(bapiHeaderValues) {
		return this.getCardItemsData(bapiHeaderValues, 'BAPI.endpoints.trendingSearch', {}, 'trendingCard');
	}

	getCachedTrendingCard(bapiHeaderValues) {
		return cacheService.getValue(cacheConfig.cache.homepageTrendingCard.name, bapiHeaderValues.locale);
	}

}
module.exports = new CardService();
