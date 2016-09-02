'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class EditAdService {

	getAd(bapiHeaderValues, adId) {
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: config.get('BAPI.endpoints.specificAd').replace('{id}', adId),
		}), bapiHeaderValues, 'getAd');
	}

	editAd(bapiHeaderValues, adId, adJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'PUT',
			path: config.get('BAPI.endpoints.specificAd').replace('{id}', adId),
		}), bapiHeaderValues, JSON.stringify(adJson), 'editAd');
	}
}

module.exports = new EditAdService();
