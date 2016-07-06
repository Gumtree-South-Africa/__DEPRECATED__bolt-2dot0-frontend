'use strict';

let ModelBuilder = require('./ModelBuilder');

let keywordService = require(process.cwd() + '/server/services/keyword');


/**
 * @description A class that Handles the Location Model
 * @constructor
 */

class KeywordModel {
	constructor(bapiHeaders, kwCount) {
		this.bapiHeaders = bapiHeaders;
		this.kwCount = kwCount;
	}

	getModelBuilder() {
		return new ModelBuilder(this.getKeywords());
	}

// Function getKeywords
	getKeywords() {

		let topKeywordFunction = () => {
			return keywordService.getTopKeywordsData(this.bapiHeaders, this.kwCount);
		};

		let trendingKeywordFunction = () => {
			return keywordService.getTrendingKeywordsData(this.bapiHeaders, this.kwCount);
		};

		return [topKeywordFunction, trendingKeywordFunction];
	}
}

module.exports = KeywordModel;
