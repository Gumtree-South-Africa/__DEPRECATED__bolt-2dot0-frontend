'use strict';

let searchService = require(process.cwd() + '/server/services/search.js');

/**
 * @description A class that Handles the Gallery Model
 * @constructor
 */
class SearchModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getSearch(/*searchTerm, location, categoryId*/) {
		// no data yet
		return {};
	}

	/**
	 * Returns type ahead results for use by client side ajax
	 * @param {string} searchTerm - user entered search team
	 * @param {lat/long} location - latitude and longitude for users location
	 */
	getAjaxTypeAhead(searchTerm, location) {
		return searchService.getTypeAheadResults(searchTerm, location);
	}
}


module.exports = SearchModel;

