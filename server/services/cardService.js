'use strict';
// let config = require('config');
// let bapiOptionsModel = require("./bapi/bapiOptionsModel");
// let bapiService      = require("./bapi/bapiService");

/**
 * Gets data based on the endpoint and parameters passed
 */
class CardService {

	// this is a temporary hack because mock services are not available in other environments
	getCardItemsData() {
		return require('q')(require(process.cwd() + '/server/services/mockData/Ads.json'));
	}

	// getCardItemsData(bapiHeaderValues, queryEndpoint, parameters) {
    //
	// 	return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
	// 		method: 'GET',
	// 		path: config.get(queryEndpoint),
	// 		extraParameters: parameters,    // bapiOptionsModel may bring 'parameters' in from config, so we use extraParameters
	// 	}), bapiHeaderValues, 'card');
	// }
}
module.exports = new CardService();
