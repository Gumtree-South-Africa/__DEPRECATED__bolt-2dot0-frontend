'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");


function getCachedData() {
	console.error('retreive cache data');
}


class RecentActivityService {

	getRecentActivities(bapiHeaderValues, geoLatLngObj) {
		let queryEndpoint = config.get('BAPI.endpoints.recentActivities');

		let apiParameters = {};
		if (geoLatLngObj) {
			apiParameters['geo'] = bapiService.bapiFormatLatLng(geoLatLngObj);
		}

		let bapiOptions = bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters,
			timeout: 20,
			callbackOnTimeout: getCachedData
		});

		return bapiService.bapiPromiseGet(bapiOptions, bapiHeaderValues, 'recentActivities');
	}

}


module.exports = new RecentActivityService();
