"use strict";

var http = require("http");
var Q = require("q");
var _ = require("underscore");

var ModelBuilder = require("./ModelBuilder");
var config = require("config");

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


// Function getPageData
var getPageData = function(scope) {
	var data = {};
	
	data.pageData = {
		"pageType"	:	scope.pagetype,
		"platform"	:	"BOLT-RUI",
		"version"	:	config.get("static.server.version"),
		"language"	:	scope.locale,
		"viewType"	:	""
	};
	
	return data;
};


DataLayerModel.prototype.getData = function() {
	var scope = this;
	var pageDeferred = Q.defer();
		
	var pageDataFunction = function(callback) {
		var data = getPageData(scope);
        pageDeferred.resolve(data);
        callback(null, data);
	};

	var arrFunctions = [pageDataFunction];
	return arrFunctions;
};

module.exports = DataLayerModel;

