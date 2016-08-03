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
		return require('q')(require(process.cwd() + '/server/services/mockData/getDraftAdResponse.json'));
	}

	saveDraft(bapiHeaderValues, machguid, draftJson) {
		let apiParameters = {};
		if (machguid !== null) {
			apiParameters['machguid'] = machguid;
		}
		if (draftJson !== null) {
			apiParameters['draftJson'] = draftJson;
		}

		return bapiService.bapiPromisePost(bapiOptionsModel.initFromConfig(config, {
			method: 'POST',
			path: config.get('BAPI.endpoints.draftAd'),
			extraParameters: apiParameters
		}), bapiHeaderValues, 'saveDraftAd');
	}

	getDraft(bapiHeaderValues, machguid) {
		let apiParameters = {};
		if (machguid !== null) {
			apiParameters['machguid'] = machguid;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: config.get('BAPI.endpoints.draftAd'),
			extraParameters: apiParameters
		}), bapiHeaderValues, 'getDraftAd');
	}
}




module.exports = new DraftAdService();
