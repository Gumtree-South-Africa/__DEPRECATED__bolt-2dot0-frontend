'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class DraftAdService {
	saveDraft(bapiHeaderValues, machguid, draftJson) {
		let pathValue = config.get('BAPI.endpoints.draftAd') + '/' + machguid;

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: pathValue
		}), bapiHeaderValues, JSON.stringify(draftJson), 'saveDraftAd');
	}

	getDraft(bapiHeaderValues, machguid) {
		let pathValue = config.get('BAPI.endpoints.draftAd') + '/' + machguid;

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: pathValue
		}), bapiHeaderValues, 'getDraftAd');
	}
}

module.exports = new DraftAdService();
