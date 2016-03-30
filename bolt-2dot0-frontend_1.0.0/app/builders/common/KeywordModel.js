"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var keywordService = require(process.cwd() + "/server/services/keyword");


/**
 * @description A class that Handles the Location Model
 * @constructor
 */

var KeywordModel = function (requestId, locale, depth) {
	this.requestId = requestId;
	this.locale = locale;
	this.depth = depth;
};

KeywordModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getKeywords());
};

// Function getKeywords
KeywordModel.prototype.getKeywords = function() {
	var scope = this;
	
	var topKeywordFunction = function(callback) {
		var topKeywordDeferred = Q.defer();
	    Q(keywordService.getTopKeywordsData(scope.requestId, scope.locale))
	        .then(function (dataTopK) {
	          topKeywordDeferred.resolve(dataTopK);
	          callback(null, dataTopK);
	      }).fail(function (err) {
	          topKeywordDeferred.reject(new Error(err));
	        callback(null, {});
	      });
	};
	
	var trendingKeywordFunction = function(callback) {
	    var trendingKeywordDeferred = Q.defer();
	    Q(keywordService.getTrendingKeywordsData(scope.requestId, scope.locale))
	        .then(function (dataTK) {
	          trendingKeywordDeferred.resolve(dataTK);
	          callback(null, dataTK);
	    }).fail(function (err) {
	          trendingKeywordDeferred.reject(new Error(err));
	        callback(null, {});
	    });
	};

	var arrFunctions = [topKeywordFunction, trendingKeywordFunction];
	return arrFunctions;
};

module.exports = KeywordModel;
