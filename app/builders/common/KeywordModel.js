'use strict';

let  Q = require('q');

let  ModelBuilder = require('./ModelBuilder');

let  keywordService = require(process.cwd() + '/server/services/keyword');


/**
 * @description A class that Handles the Location Model
 * @constructor
 */

let  KeywordModel = function(bapiHeaders, kwCount) {
	this.bapiHeaders = bapiHeaders;
	this.kwCount = kwCount;
};

KeywordModel.prototype.getModelBuilder = function() {
	return new ModelBuilder(this.getKeywords());
};

// Function getKeywords
KeywordModel.prototype.getKeywords = function() {
	let  _this = this;

	let  topKeywordFunction = function(callback) {
		let  topKeywordDeferred = Q.defer();
		Q(keywordService.getTopKeywordsData(_this.bapiHeaders, _this.kwCount))
			.then(function(dataTopK) {
				topKeywordDeferred.resolve(dataTopK);
				callback(null, dataTopK);
			}).fail(function(err) {
			topKeywordDeferred.reject(new Error(err));
			callback(null, {});
		});
	};

	let  trendingKeywordFunction = function(callback) {
		let  trendingKeywordDeferred = Q.defer();
		Q(keywordService.getTrendingKeywordsData(_this.bapiHeaders, _this.kwCount))
			.then(function(dataTK) {
				trendingKeywordDeferred.resolve(dataTK);
				callback(null, dataTK);
			}).fail(function(err) {
			trendingKeywordDeferred.reject(new Error(err));
			callback(null, {});
		});
	};

	let  arrFunctions = [topKeywordFunction, trendingKeywordFunction];
	return arrFunctions;
};

module.exports = KeywordModel;
