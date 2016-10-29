'use strict';

let config = require('config');
let bapiService = require("./bapi/bapiService");

class ImageCategoryService {
	getCategory(bapiHeaderValues, imageUrl) {
		let localeString = bapiHeaderValues.locale;
		localeString = localeString === "es_MX" ? "es_MX_VNS" : localeString;
		let queryPath = "/imageCategory/" + localeString + "/url?url=" + imageUrl;

		let options = {
			host: config.get('irs.server.host'),
			path: queryPath,
			port: config.get('irs.server.port'),
			method: 'GET',
			extraParameters: null,
			timeout: config.get('irs.server.timeout')
		};
		return bapiService.bapiPromiseGet(options, bapiHeaderValues, 'imageCategoryService');
	}
}

module.exports = new ImageCategoryService();
