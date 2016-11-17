'use strict';

let specHelper = require('../../helpers/commonSpecHelper');
const SearchpageUrl = specHelper.getBaseUrl() + '/search/';

class SearchpagePO {
	constructor() {
		//TODO add UI elements to test
	}

	getUrl() {
		return SearchpageUrl;
	}

	getDomain() {
		let parts = SearchpageUrl.split(/\/\/|:/);	// split on // or :
		// ex:
		// 0 = "http"
		// 1 = ""
		// 2 = "www.vivanuncios.com.mx.localhost"
		// 3 = "8000/"
		return parts[2];
	}

	visitPage() {
		browser.get(SearchpageUrl);
	}
}

module.exports = SearchpagePO;
