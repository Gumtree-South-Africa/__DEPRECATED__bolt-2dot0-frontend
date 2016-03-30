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
	this.header = new HeaderModel(req.secure, req, res);
	this.headerBuilder = this.header.getModelBuilder();
	this.footer = new FooterModel(req.secure, req, res);
	this.footerBuilder = this.footer.getModelBuilder();
	this.dataLayer = new DataLayerModel(req, res);
	this.dataLayerBuilder = this.dataLayer.getModelBuilder();
};

BasePageModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getCommonData());
};

BasePageModel.prototype.getCommonData = function() {
	var scope = this;
	var headerFunction = function(callback) { 
		var headerDeferred = Q.defer();
		Q(scope.headerBuilder.processParallel())
	    	.then(function (dataH) {
	    		headerDeferred.resolve(dataH[0]);
	    		callback(null, dataH[0]);
			}).fail(function (err) {
				headerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var footerFunction = function(headerData, callback) { 
		var footerDeferred = Q.defer();
		Q(scope.footerBuilder.processParallel())
	    	.then(function (dataF) {
	    		// Resolve promise with necessary data for the callee
	    		footerDeferred.resolve(dataF[0]);
	    		
	    		// Merge data and send the comibned data to the next function in waterfall
	    		var headerFooterData = {
	    			"header"	:	headerData,
	    			"footer"	:	dataF[0]
	    		};
	    		callback(null, headerFooterData);
			}).fail(function (err) {
				footerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var dataLayerFunction = function(headerFooterData, callback) { 
		// use data from headerFooterData
		scope.dataLayer.setUserId(headerFooterData.header.id);
		scope.dataLayer.setUserEmail(headerFooterData.header.userEmail);
		
		var dataLayerDeferred = Q.defer();
		Q(scope.dataLayerBuilder.processParallel())
	    	.then(function (dataD) {
	    		dataLayerDeferred.resolve(dataD[0]);
	    		
	    		var combinedData = headerFooterData;
	    		combinedData.dataLayer = dataD[0];
	    		callback(null, combinedData);
			}).fail(function (err) {
				dataLayerDeferred.reject(new Error(err));
				callback(null, {});
			});
	};
	
	var arrFunctions = [headerFunction, footerFunction, dataLayerFunction];
	return arrFunctions;
};
	
module.exports = BasePageModel;

