'use strict';

let solrService = require(process.cwd() + '/server/utils/solr');

/**
 * Gets data based on the endpoint and parameters passed
 */
class SearchService {

	getAutoCompleteResults(country, locationId, categoryId, keywords) {
		return solrService.autoComplete(country, locationId, categoryId, keywords);
	}

	getSearchResults(/*bapiHeaderValues, queryEndpoint, parameters */) {}
}
module.exports = new SearchService();
