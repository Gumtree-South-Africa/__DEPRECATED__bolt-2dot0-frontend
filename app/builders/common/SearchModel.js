'use strict';

let searchService = require(process.cwd() + '/server/services/search.js');

/**
 * @description A class that Handles the Gallery Model
 * @constructor
 */
class SearchModel {
	constructor(country, bapiHeaders) {
		this.country = country;
		this.bapiHeaders = bapiHeaders;
	}

	getSearch(/*searchTerm, location, categoryId*/) {
		// no data yet
		return {};
	}

	/**
	 * Returns auto complete results for use by client side ajax
	 * @param {string} searchTerm - user entered search team
	 * @param {locationId} locationId
	 * @param {categoryId} categoryId
	 */
	autoComplete(searchTerm, locationId, categoryId) {
		return searchService.getAutoCompleteResults(this.country, locationId, categoryId, searchTerm);
	}
}


module.exports = SearchModel;

