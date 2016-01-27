"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("../../common/ModelBuilder");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var HeaderModel = require("../../common/HeaderModel");
var keywordModel = require("../../common/keywordModel");
var BasePageModel = require("../../common/BasePageModel");


/**
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var HomePageModel = function (req, res) {
	var headerFunction = BasePageModel.call(this, req, res);
	var loc = new LocationModel(res.config.locale, 2),
			cat = new CategoryModel(res.config.locale, 2),
			keyword = new keywordModel(res.config.locale, 2);

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

	var keywordsFunction = function(callback) {
		var keywordsDeferred = Q.defer();
		Q(keyword.processParallel())
	    	.then(function (dataK) {
	    		console.log("Inside keyword from homepageModel");
	    		console.dir(dataK);
	    		keywordsDeferred.resolve(dataK);
	    		callback(null, dataK);
			}).fail(function (err) {
				keywordsDeferred.reject(new Error(err));
				callback(null, {});
			});
	};

	var arrFunctions = [ headerFunction, locationFunction, categoryFunction, keywordsFunction ];
	var homepageModel = new ModelBuilder(arrFunctions);

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
