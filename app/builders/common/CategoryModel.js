'use strict';

let Q = require('q');

let  categoryService = require(process.cwd() + '/server/services/category');


/**
 * @description A class that Handles the Category Model
 * @constructor
 */
let  CategoryModel = function(bapiHeaders, depth, locationId) {
	this.bapiHeaders = bapiHeaders;
	this.depth = depth;
	this.locationId = locationId;
};

//Function getCategories
CategoryModel.prototype.getCategories = function() {
	let  _this = this;
	let  categoryDeferred = Q.defer();
	let  data = {};

	if (typeof _this.bapiHeaders.locale !== 'undefined') {
		Q(categoryService.getCategoriesData(_this.bapiHeaders, _this.depth))
			.then(function(dataReturned) {
				data = dataReturned;
				categoryDeferred.resolve(data);
			}).fail(function(err) {
			categoryDeferred.reject(new Error(err));
		});
	}

	return categoryDeferred.promise;
};

//Function getCategoriesWithLocId
CategoryModel.prototype.getCategoriesWithLocId = function() {

	let  categoryDeferred = Q.defer();
	let  data = {};

	if (typeof this.bapiHeaders.locale !== 'undefined') {
		Q(categoryService.getCategoriesDataWithLocId(this.bapiHeaders, this.depth, this.locationId))
			.then(function(dataReturned) {
				data = dataReturned;
				categoryDeferred.resolve(data);
			}).fail(function(err) {
			categoryDeferred.reject(new Error(err));
		});
	}

	return categoryDeferred.promise;
};

module.exports = CategoryModel;

