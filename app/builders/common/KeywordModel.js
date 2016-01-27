"use strict";

var http = require("http");
var Q = require("q");

var ModelBuilder = require("./ModelBuilder");

var keywordService = require(process.cwd() + "/server/services/keyword");


/**
 * @description A class that Handles the Location Model
 * @constructor
 */

var keywordModel = function (locale, depth) {
	this.locale = locale;
	this.depth = depth;
  return new ModelBuilder(this.getKeywords());
};


// Function getLocations
keywordModel.prototype.getKeywords = function() {
	var scope = this;
  var topKeywordFunction = function(callback) {
    var topKeywordDeferred = Q.defer();
    Q(keywordService.getTopKeywordsData(scope.locale))
        .then(function (dataTopK) {
          console.log("Inside topKeyword");
          console.dir(dataTopK);
          topKeywordDeferred.resolve(dataTopK);
          callback(null, dataTopK);
      }).fail(function (err) {
          topKeywordDeferred.reject(new Error(err));
        callback(null, {});
      });
  };
  var trendingKeywordFunction = function(callback) {
    var trendingKeywordDeferred = Q.defer();
    Q(keywordService.getTrendingKeywordsData(scope.locale))
        .then(function (dataTK) {
          console.log("Inside trendingKeyword");
          console.dir(dataTK);
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

module.exports = keywordModel;
