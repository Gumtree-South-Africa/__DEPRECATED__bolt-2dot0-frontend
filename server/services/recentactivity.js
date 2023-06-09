'use strict';

let cwd = process.cwd();
let config = require('config');

let bapiOptionsModel = require(cwd + "/server/services/bapi/bapiOptionsModel");
let bapiService      = require(cwd + "/server/services/bapi/bapiService");

let cacheConfig  = require(cwd + '/server/config/site/cacheConfig.json');
let cacheService = require(cwd + "/server/services/cache/cacheService");


class RecentActivityService {

	getRecentActivities(bapiHeaderValues, geoLatLngObj) {
		let queryEndpoint = config.get('BAPI.endpoints.recentActivities');

		let apiParameters = {};
		if (geoLatLngObj) {
			apiParameters['geo'] = bapiService.bapiFormatLatLng(geoLatLngObj);
		}
		apiParameters.limit = 50;

		let bapiOptions = bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters,
			timeout: cacheConfig.cache.homepageRecentActivityCard.bapiTimeout
		});

		return bapiService.bapiPromiseGet(bapiOptions, bapiHeaderValues, 'recentActivities');
	}

	getCachedRecentActivities(bapiHeaderValues) {
		return cacheService.getValue(cacheConfig.cache.homepageRecentActivityCard.name, bapiHeaderValues.locale);
	}

}


module.exports = new RecentActivityService();
