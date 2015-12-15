"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var BasePageModel = require("./BasePageModel");
var BAPICall = require("../lib/BAPICall");
var BAPIUrl= require("../lib/BAPIUrl");

/** 
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var LocationModel = function () {
    return new BasePageModel(LocationModel.getWaterfallCalls(),
    	LocationModel.tomAntonyFn);
};
 

// FUNCTION SAMPLES FOR DEMO
// This function will be executed at the end of the list of functions
// for waterfall demo.
LocationModel.tomAntonyFn = function(myData, myPromise) {
	setTimeout(function () {
		if (myPromise) {
			myData = _.extend(myData, {"boss" : "Tom Antony"});
			myPromise.resolve(myData);
		}
	}, 5000);
};

LocationModel.getWaterfallCalls = function() {
	var arrFunctions = [

		function (callback) {
			var data = {};

			if (typeof callback !== "function") {
				return;
			}

			// Make BAPI call
			// Mock data
			data = {
				"v1" : "Bloemfotein",
				"v2" : "Cape Town",
				"v3" : "Durban City",
				"v4" : "Gauteng"
			};
			// Retrieve the data

			// BAPI url (class) from config with interface-like
			// Pass JSON with parameters 
			// Tweak BAPI url for locale, location, category, etc (rebuild bapi)
			// processData from config
			// *** type of processing (Parallel, Waterfall, Series)
			// i18n

			// Arrage data (build page model)
			// data = processData();

			callback(null, data);
		},

		function (arg1, callback) {
			var data = {};

			if (typeof callback !== "function") {
				return;
			}

			// options for POST
			var defaultOptions = {
		   		host : "jsonplaceholder.typicode.com", // here only the domain name// (no http/https !)
		    	port : 80,
		    	path : "/posts",
		    	method : "POST"
			};


			// console.log("*******@@@@@@********@@@@@@@*********");
			// var bp = new BAPIUrl("/s-all-the-ads/v1b0p1");

			var D = new BAPICall(defaultOptions, arg1, callback);
			D.preparePost();
		},

		function (arg1, callback) {
			var data = {};

			if (typeof callback !== "function") {
				return;
			}

			// options for GET
			var defaultOptions = {
		   		host : "jsonplaceholder.typicode.com",
		    	port : 80,
		    	path : "/posts/2",
		    	method : "GET"
			};

			var D = new BAPICall(defaultOptions, arg1, callback);
			// D.setIgnoreError(false);
			D.prepareGet();
		},

		function (arg1, callback) {
			var data = {};

			if (typeof callback !== "function") {
				return;
			}

			// Mock data
			data = {
				"v5" : "Limpopo",
				"v6" : "Northern Cape",
				"v7" : "Mpumalanga",
				"v8" : "Wester Cape"
			};


			data = _.extend(data, arg1);

			callback(null, data);
		}
	];
	return arrFunctions;
};

module.exports = LocationModel;

