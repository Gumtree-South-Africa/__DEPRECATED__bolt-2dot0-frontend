"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");
var HeaderModel = require("./HeaderModel");

/** 
 * @description A class that Handles the common models in every page
 * @constructor
 */
var BasePageModel = function (req, res) {
	var cookieName = "bt_auth";
	var authcookie = req.cookies[cookieName];	    
	var header = new HeaderModel(authcookie, res.config.locale);

	var headerFunction = function(callback) { 
		var headerDeferred = Q.defer();
		Q(header.processParallel())
	    	.then(function (dataH) {
	    		console.log("Inside basepagemodel header");
	    		headerDeferred.resolve(dataH[0]);
	    		callback(null, dataH[0]);
			}).fail(function (err) {
				headerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	return headerFunction;
};

module.exports = BasePageModel;

