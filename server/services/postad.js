'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class PostAdService {

	// this is a temporary hack because mock services are not available in other environments
	quickpostAdMock() {
		return require('q')(require(process.cwd() + '/server/services/mockData/postAdResponse.json'));
	}

	quickpostAd(bapiHeaderValues, adJson) {

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.quickpostAd'),
		}), bapiHeaderValues, JSON.stringify(adJson), 'quickpostAd');
	}
}




module.exports = new PostAdService();
