'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

/**
 * Gets data based on the endpoint and parameters passed
 */
class CardService {

	// this is a temporary hack because mock services are not available in other environments
	mockGetCardItemsData() {
		return require('q')(require(process.cwd() + '/test/serverUnit/mockData/vmAds.json'));
	}

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
	 	}), bapiHeaderValues, 'card');
	}
}
module.exports = new CardService();
