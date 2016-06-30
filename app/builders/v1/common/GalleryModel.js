'use strict';

let ModelBuilder = require('./ModelBuilder');

let hpAdService = require(process.cwd() + '/server/services/homepage-ads');


/**
 * @description A class that Handles the Gallery Model
 * @constructor
 */

class GalleryModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getModelBuilder() {
		return new ModelBuilder(this.getHomePageGallery());
	}

	// Function getHomePageGallery
	getHomePageGallery() {
		return [
			() => {
				let data = {};
				if (typeof this.bapiHeaders.locale !== 'undefined') {
					return hpAdService.getHomepageGallery(this.bapiHeaders);
				} else {
					return data;
				}
			}
		];
	}

	//Function getAjaxGallery
	getAjaxGallery(offset, limit) {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return hpAdService.getAjaxGallery(this.bapiHeaders, offset, limit);
		} else {
			return {};
		}
	}

}
module.exports = GalleryModel;

