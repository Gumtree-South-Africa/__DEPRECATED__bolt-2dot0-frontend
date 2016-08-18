'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class PostAdService {
	quickpost(bapiHeaderValues, adJson) {
		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.quickpostAd'),
		}), bapiHeaderValues, JSON.stringify(adJson), 'postAd');
	}
}

module.exports = new PostAdService();
