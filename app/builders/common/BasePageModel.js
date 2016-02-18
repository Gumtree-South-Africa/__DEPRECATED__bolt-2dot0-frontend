"use strict";

//var fs = require("fs");
var async = require("async");
var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");
var HeaderModel = require("./HeaderModel");
var FooterModel = require("./FooterModel");
var DataLayerModel = require("./DataLayerModel");

/** 
 * @description A class that Handles the common models in every page
 * @constructor
 */
var BasePageModel = function (req, res) {

	var cookieName = "bt_auth";
	var authcookie = req.cookies[cookieName];
	this.header = new HeaderModel(false, req, res);
	this.footer = new FooterModel(false, req, res);
	this.dataLayer = new DataLayerModel(req, res);
};

BasePageModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getCommonData());
};

BasePageModel.prototype.getCommonData = function() {
	var scope = this;
	var headerFunction = function(callback) { 
		var headerDeferred = Q.defer();
		Q(scope.header.processParallel())
	    	.then(function (dataH) {
	    		console.log("Inside basepagemodel header");
	    		headerDeferred.resolve(dataH[0]);
	    		callback(null, dataH[0]);
			}).fail(function (err) {
				headerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var footerFunction = function(callback) { 
		var footerDeferred = Q.defer();
		Q(scope.footer.processParallel())
	    	.then(function (dataF) {
	    		console.log("Inside basepagemodel footer");
	    		footerDeferred.resolve(dataF[0]);
	    		callback(null, dataF[0]);
			}).fail(function (err) {
				footerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var dataLayerFunction = function(callback) { 
		var dataLayerDeferred = Q.defer();
		Q(scope.dataLayer.processParallel())
	    	.then(function (dataD) {
	    		console.log("Inside basepagemodel dataLayer", dataD);
	    		dataLayerDeferred.resolve(dataD[0]);
	    		callback(null, dataD[0]);
			}).fail(function (err) {
				dataLayerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var arrFunctions = [headerFunction, footerFunction, dataLayerFunction];
	return arrFunctions;
};
	
module.exports = BasePageModel;

