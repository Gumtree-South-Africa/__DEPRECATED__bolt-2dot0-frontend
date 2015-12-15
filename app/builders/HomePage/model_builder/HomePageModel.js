"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var BasePageModel = require("../../common/BasePageModel");
var LocationModel = require("../../common/LocationModel");
var CategoryModel = require("../../common/CategoryModel");
var CarouselGalleryModel = require("./CarouselGalleryModel");

/** 
 * @description A class that Handles the HomePage Model
 * @constructor
 */
var HomePageModel = function () {
	var m1,
		m2,
		m3;
	var homepageDeferred = Q.defer();

	console.log("CREATING HOMEPAGE MODEL !!!!");
    m1 = LocationModel();

    // console.log("^^^^ WATERFALL DEMO ^^^^");
    Q(m1.processWaterfall())
    	.then(function (dataS) {
    		// console.log("*** The final data is:");
			// console.log(dataS);
    		homepageDeferred.resolve(dataS);
		}).fail(function (err) {
			homepageDeferred.reject(new Error(err));
		});

	return homepageDeferred.promise;
};

module.exports = HomePageModel;

