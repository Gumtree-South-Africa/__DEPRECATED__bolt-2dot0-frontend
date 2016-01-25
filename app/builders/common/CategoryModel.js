"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var categoryService = require(process.cwd() + "/server/services/category");


/** 
 * @description A class that Handles the Category Model
 * @constructor
 */
var CategoryModel = function (locale, depth) {
	this.locale = locale;
	this.depth = depth;
     return new ModelBuilder(this.getCategories());
};


//Function getCategories
CategoryModel.prototype.getCategories = function () {
	var scope = this;
	var arrFunctions = [
		function (callback) {
			var categoryDeferred,
				data = {};
			if (typeof callback !== "function") {
				return;
			}
			
			if (typeof scope.depth !== "undefined") {
				categoryDeferred = Q.defer();
				console.log("Calling CategoryService");
			    
				 Q(categoryService.getCategoriesData(scope.locale, scope.depth))
			    	.then(function (dataReturned) {
			    		data = dataReturned;
			    		categoryDeferred.resolve(data);
					    callback(null, data);
					}).fail(function (err) {
						categoryDeferred.reject(new Error(err));
					    callback(null, data);
					});

				return categoryDeferred.promise;
			} else {
			    callback(null, data);
			}
		}
	];

	return arrFunctions;	
};

module.exports = CategoryModel;

