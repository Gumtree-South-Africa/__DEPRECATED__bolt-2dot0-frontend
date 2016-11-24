'use strict';

let imageRecognitionService = require(process.cwd() + '/server/services/ImageRecognitionService');
let Q = require("q");

/**
 * @description A class that Handles the Image Recognition Model
 * @constructor
 */
class ImageRecognitionModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	recognizeCategoryFromImage(imageUrl) {
		if (!imageUrl) {
			return Q.reject(new Error("recognizeCategoryFromImage expecting imageUrl parameter, rejecting promise"));
		}
		return imageRecognitionService.getCategory(this.bapiHeaders, imageUrl);
	}
}

module.exports = ImageRecognitionModel;
