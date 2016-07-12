'use strict';

let categoryService = require(process.cwd() + '/server/services/category');


/**
 * @description A class that Handles the Category Model
 * @constructor
 */
class CategoryModel {
	constructor(bapiHeaders, depth, locationId) {
		this.bapiHeaders = bapiHeaders;
		this.depth = depth;
		this.locationId = locationId;
	}

//Function getCategories
	getCategories() {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return categoryService.getCategoriesData(this.bapiHeaders, this.depth);
		}
	}

//Function getCategoriesWithLocId
	getCategoriesWithLocId() {
		if (typeof this.bapiHeaders.locale !== 'undefined') {
			return categoryService.getCategoriesDataWithLocId(this.bapiHeaders, this.depth, this.locationId);
		}
	}

}
module.exports = CategoryModel;

