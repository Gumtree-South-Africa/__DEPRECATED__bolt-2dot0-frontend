"use strict";

//var fs = require("fs");
var http = require("http");

var BasePageModel = require("./BasePageModel");
var BAPICall = require("../lib/BAPICall");
var BAPIUrl= require("../lib/BAPIUrl");

var categoryService = require(process.cwd() + "/server/services/category");

/** 
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var CategoryModel = function () {
    return new BasePageModel(CategoryModel.getRESTCalls());
};

CategoryModel.getRESTCalls = function () {
	var arrFunctions = [
		function first(callback) {
			var data = {};
			if (typeof callback !== "function") {
				return;
			}

    		data = {
    			a : { "id" : "1233", name : "Autos" },
    			b : { "id" : "12", name : "Property" },
    			c : { "id" : "9023", name : "Jobs" },
    			d : { "id" : "45", name : "Home and Garden" },
    			e : { "id" : "19", name : "Electronics" }
    		};
    		callback(null, data);
    		
		},  

		function second(callback) {
			var data = {};
			if (typeof callback !== "function") {
				return;
			}

    		data = {
    			o : { "id" : "30", name : "Services" },
    			p : { "id" : "321", name : "B2B" },
    			q : { "id" : "836", name : "Baby/Kids" },
    			s : { "id" : "7", name : "Fashion" }
    		};
    		callback(null, data);
		},
		
		function third(callback) {
			var data = {};
			if (typeof callback !== "function") {
				return;
			}
			
			console.log("Calling CategoryService");
		    data = categoryService.getHomePageCategories();
		    console.dir(data);
		    console.log("Calling Returned");
		    
		    callback(null, data);
		}
	];

	return arrFunctions;
};

module.exports = CategoryModel;

