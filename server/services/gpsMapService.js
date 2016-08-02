'use strict';

let solrService = require(process.cwd() + '/server/utils/solr');

//let bapiOptionsModel = require("./bapi/bapiOptionsModel");
//let bapiService      = require("./bapi/bapiService");


/**
 * Gets data based on the endpoint and parameters passed
 */
class GpsMapService {

	getMapData(country, geo) {
		return solrService.mapSearch(country, geo);
		// return Q(require(process.cwd() + '/server/services/mockData/Map.json'));
	}

	// getMapData(/* bapiHeaderValues, parameters */) {
		// Invoke BAPI
		// Wrap in a promise so the outside then doesn't break;
		// return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
		//  method: 'GET',
		//  path: config.get(queryEndpoint),
		//  extraParameters: parameters,    // bapiOptionsModel may bring 'parameters' in from config, so we use extraParameters
		// }), bapiHeaderValues, 'card');
	// }
}

module.exports = new GpsMapService();
