"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");
var config = require("config");

var pagetypeJson = require(process.cwd() + "/app/config/pagetype.json");


//Function getPageData
var getPageData = function(scope) {
	var pageData = {
		"pageType"	:	scope.pagetype,
		"platform"	:	"BOLT-RUI",
		"version"	:	config.get("static.server.version"),
		"language"	:	scope.locale,
		"viewType"	:	""
	};
	
	return pageData;
};

//Function getUserData
var getUsereData = function(scope) {
	console.log("@raj:");
	console.log(">>>>> The user id is: " + scope.userid);
	
	var userData = {
		"hashedUserId"		:	"",
		"hashedUserEmail"	:	"",
		"hashedAccountId"	:	"",
		"accountType"		:	"",
		"loggedIn"			:	""
	};
	
	return userData;
};

//Function getCatData
var getCatData = function(scope) {
	var categoryData = {
		"current"	:	"",
		"level0"	:	"",
		"level1"	:	"",
		"level2"	:	"",
		"level3"	:	"",
		"level4"	:	""
	};
	
	return categoryData;
};

//Function getLocData
var getLocData = function(scope) {
	var locationData = {
		"current"	:	"",
		"level0"	:	"",
		"level1"	:	"",
		"level2"	:	"",
		"level3"	:	"",
		"level4"	:	""
	};
	
	return locationData;
};

//Function getAdData
var getAdData = function(scope) {
	var adData = {
		"current"	:	"",
		"level0"	:	""
	};
	
	return adData;
};

//Function getReplyData
var getReplyData = function(scope) {
	var replyData = {
		"current"	:	"",
		"level0"	:	""
	};
	
	return replyData;
};

//Function getSearchData
var getSearchData = function(scope) {
	var searchData = {
		"current"	:	"",
		"level0"	:	""
	};
	
	return searchData;
};

//Function getEcommerceData
var getEcommerceData = function(scope) {
	var ecommerceData = {
		"current"	:	"",
		"level0"	:	""
	};
	
	return ecommerceData;
};


/** 
 * @description A class that Handles the DataLayer Model
 * @constructor
 */
var DataLayerModel = function (req, res) {
	// Local Variables
	this.locale = res.config.locale;
	this.brandName = res.config.name;
	this.country = res.config.country;
	this.pagetype = req.pagetype;
};

DataLayerModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getData());
};

DataLayerModel.prototype.setUserId = function(userid) {
	this.userid = userid;
};

DataLayerModel.prototype.setUserEmail = function(useremail) {
	this.useremail = useremail;
};

DataLayerModel.prototype.getData = function() {
	var scope = this;
	var pageDeferred = Q.defer();
		
	var pageDataFunction = function(callback) {
		var data = {};
		switch (scope.pagetype) {
			case pagetypeJson.pagetype.HOMEPAGE: 
				data = {
					"pageData"		: 	getPageData(scope),
					"userData"		:	getUsereData(scope)
				};
			break;
			case pagetypeJson.pagetype.RESULTS_SEARCH:
				data = {
					"pageData"		: 	getPageData(scope),
					"userData"		:	getUsereData(scope),
					"categoryData"	:	getCatData(scope),
					"locationData"	:	getLocData(scope)
				};
			break;
		}
		
        pageDeferred.resolve(data);
        callback(null, data);
	};

	var arrFunctions = [pageDataFunction];
	return arrFunctions;
};

module.exports = DataLayerModel;

