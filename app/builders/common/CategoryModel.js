'use strict';

var http = require('http'),
	Q = require('q');

var categoryService = require(process.cwd() + '/server/services/category');


/** 
 * @description A class that Handles the Category Model
 * @constructor
 */
var CategoryModel = function (bapiHeaders, depth, locationId) {
	this.bapiHeaders = bapiHeaders;
	this.depth = depth;
	this.locationId = locationId;
};

//Function getCategories
CategoryModel.prototype.getCategories = function() {
	var scope = this;
	var categoryDeferred = Q.defer();
	var data = {};

	if (typeof scope.bapiHeaders.locale !== 'undefined') {
		Q(categoryService.getCategoriesData(scope.bapiHeaders, scope.depth))
			.then(function (dataReturned) {
				data = dataReturned;
				categoryDeferred.resolve(data);
			}).fail(function (err) {
				categoryDeferred.reject(new Error(err));
			});
	}

	return categoryDeferred.promise;
};

//Function getCategoriesWithLocId
CategoryModel.prototype.getCategoriesWithLocId = function() {
	var scope = this;
	var categoryDeferred = Q.defer();
	var data = {};

	if (typeof scope.bapiHeaders.locale !== 'undefined') {
		Q(categoryService.getCategoriesDataWithLocId(scope.bapiHeaders, scope.depth, scope.locationId))
			.then(function (dataReturned) {
				data = dataReturned;
				categoryDeferred.resolve(data);
			}).fail(function (err) {
				categoryDeferred.reject(new Error(err));
			});
	}

	return categoryDeferred.promise;
};

module.exports = CategoryModel;

