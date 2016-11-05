'use strict';

let config = require('config');
let bapiService = require("./bapi/bapiService");

class ImageRecognitionService {
	getCategory(bapiHeaderValues, imageUrl) {
		let localeString = bapiHeaderValues.locale;
		localeString = localeString === "es_MX" ? "es_MX_VNS" : localeString;
		let queryPath = "/imageCategory/" + localeString + "/url?url=" + imageUrl;

		let options = {
			host: config.get('imageRecognitionService.server.host'),
			path: queryPath,
			port: config.get('imageRecognitionService.server.port'),
			method: 'GET',
			extraParameters: null,
			timeout: config.get('imageRecognitionService.server.timeout')
		};
		return bapiService.bapiPromiseGet(options, bapiHeaderValues, 'imageCategoryService');
	}
}

module.exports = new ImageRecognitionService();
