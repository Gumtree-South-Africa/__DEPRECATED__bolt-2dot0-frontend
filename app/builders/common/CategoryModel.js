"use strict";

var http = require("http");
var Q = require("q");

var BasePageModel = require("./BasePageModel");

var categoryService = require(process.cwd() + "/server/services/category");


/** 
 * @description A class that Handles the Category Model
 * @constructor
 */
var CategoryModel = function (depth) {
     return new BasePageModel(this.getCategories(depth));
};


//Function getCategories
CategoryModel.prototype.getCategories = function (depth) {
	var arrFunctions = [
		function (callback) {
			var categoryDeferred,
				data = {};
			if (typeof callback !== "function") {
				return;
			}
			
			if (typeof depth != "undefined") {
				categoryDeferred = Q.defer();
				console.log("Calling CategoryService");
			    
				 Q(categoryService.getCategoriesData(depth))
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

