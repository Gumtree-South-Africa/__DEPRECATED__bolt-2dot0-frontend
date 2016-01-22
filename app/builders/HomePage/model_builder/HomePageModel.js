"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var BasePageModel = require("../../common/BasePageModel");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var HeaderModel = require("../../common/HeaderModel");


/** 
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var HomePageModel = function (btcookie) {
	var loc = new LocationModel(2),
		cat = new CategoryModel(2),
		header = new HeaderModel(btcookie);

	var headerFunction = function(callback) { 
		var headerDeferred = Q.defer();
		Q(header.processParallel())
	    	.then(function (dataH) {
	    		console.log("Inside homepagemodel header");
	    		console.dir(dataH);
	    		headerDeferred.resolve(dataH[0]);
	    		callback(null, dataH[0]);
			}).fail(function (err) {
				headerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var locationFunction = function(callback) { 
		var locationDeferred = Q.defer();
		Q(loc.processParallel())
	    	.then(function (dataL) {
	    		console.log("Inside homepagemodel locations");
	    		console.dir(dataL);
	    		locationDeferred.resolve(dataL[0]);
	    		callback(null, dataL[0]);
			}).fail(function (err) {
				locationDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var categoryFunction = function(callback) { 	
		var categoryDeferred = Q.defer();
		Q(cat.processParallel())
	    	.then(function (dataC) {
	    		console.log("Inside homepagemodel categories");
	    		console.dir(dataC);
	    		categoryDeferred.resolve(dataC[0]);
	    		callback(null, dataC[0]);
			}).fail(function (err) {
				categoryDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var arrFunctions = [ headerFunction, locationFunction, categoryFunction ];
	var homepageModel = new BasePageModel(arrFunctions);

	var homepageDeferred = Q.defer();
	Q(homepageModel.processParallel())
    	.then(function (data) {
    		console.log("Inside homepagemodel Combined");
    		console.dir(data);
    		homepageDeferred.resolve(data);    		
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});
	return homepageDeferred.promise;
};

module.exports = HomePageModel;

