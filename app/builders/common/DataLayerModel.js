"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");
var config = require("config");


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
		var pagedata = getPageData(scope);
		var userdata = getUsereData(scope);
		var catdata = getCatData(scope);
		var locdata = getLocData(scope);
		
		var data = {
			"pageData"		: 	pagedata,
			"userData"		:	userdata,
			"categoryData"	:	catdata,
			"locationData"	:	locdata,
		};
		
        pageDeferred.resolve(data);
        callback(null, data);
	};

	var arrFunctions = [pageDataFunction];
	return arrFunctions;
};

module.exports = DataLayerModel;

