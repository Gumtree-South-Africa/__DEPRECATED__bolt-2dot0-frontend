'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class RecentActivityService {
	getRecentActivities(bapiHeaderValues, geoLatLng) {
		let queryEndpoint = config.get('BAPI.endpoints.recentActivities');

		let apiParameters = {};
		if (geoLatLng !== null) {
			apiParameters['geo'] = geoLatLng;
		}

		let bapiOptions = bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters
		});

		return bapiService.bapiPromiseGet(bapiOptions, bapiHeaderValues, 'recentActivities');
	}
}

module.exports = new RecentActivityService();
