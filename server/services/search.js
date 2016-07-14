'use strict';
// let config = require('config');
let Q = require('q');
// let bapiOptionsModel = require("./bapi/bapiOptionsModel");
// let bapiService = require("./bapi/bapiService");
/**
 * Gets data based on the endpoint and parameters passed
 */
class SearchService {
	getTypeAheadResults(/*bapiHeaderValues, queryEndpoint, parameters*/) {
		// Invoke BAPI
		// Wrap in a promise so the outside then doesn't break;
		return Q(require(process.cwd() + '/server/services/mockData/SearchAutoComplete.json'));
		// return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		// 	method: 'GET',
		// 	path: config.get(queryEndpoint),
		// 	extraParameters: parameters    // bapiOptionsModel may bring 'parameters' in from config, so we use extraParameters
		// }), bapiHeaderValues, 'typeAheadSearch');
	}

	getSearchResults(/*bapiHeaderValues, queryEndpoint, parameters */) {}
}
module.exports = new SearchService();
