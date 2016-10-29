'use strict';

let imageCategoryService = require(process.cwd() + '/server/services/imageCategoryService');
let Q = require("q");

/**
 * @description A class that Handles the Category Model
 * @constructor
 */
class IrsModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getImageCategory(imageUrl) {
		if (!imageUrl) {
			return Q.reject(new Error("getMostRelevantCategory expecting imageUrl parameter, rejecting promise"));
		}
		return imageCategoryService.getCategory(this.bapiHeaders, imageUrl);
	}
}

module.exports = IrsModel;
