'use strict';

let config = require('config');
let bapiService = require("./bapi/bapiService");
let bapiOptionsModel = require("./bapi/bapiOptionsModel");

class ImageRecognitionService {
	getCategory(bapiHeaderValues, imageUrl) {
		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: config.get('BAPI.endpoints.categorySuggest') + "imageUrl=" + imageUrl,
		}), bapiHeaderValues, 'imageCategoryService');
	}
}

module.exports = new ImageRecognitionService();
