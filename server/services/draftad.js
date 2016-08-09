'use strict';

let config = require('config');
let bapiOptionsModel = require("./bapi/bapiOptionsModel");
let bapiService      = require("./bapi/bapiService");

class DraftAdService {

	// this is a temporary hack because mock services are not available in other environments
	saveDraftMock() {
		return require('q')(require(process.cwd() + '/server/services/mockData/saveDraftAdResponse.json'));
	}

	// this is a temporary hack because mock services are not available in other environments
	getDraftMock() {
		// return require('q').reject(new Error("test error - could not get draft"));
		return require('q')(require(process.cwd() + '/server/services/mockData/getDraftAdResponse.json'));
	}

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
