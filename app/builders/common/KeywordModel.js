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

	getModelBuilder(adId) {
		return new ModelBuilder(this.getKeywords(adId));
	}

// Function getKeywords
	getKeywords(adId) {

		let topKeywordFunction = () => {
			return keywordService.getTopKeywordsData(this.bapiHeaders, adId, this.kwCount);
		};

		let trendingKeywordFunction = () => {
			return keywordService.getTrendingKeywordsData(this.bapiHeaders, adId, this.kwCount);
		};

		let suggestedKeywordFunction = () => {
			return keywordService.getSuggestedKeywordsData(this.bapiHeaders, adId, this.kwCount);
		};

		if ((typeof adId !== 'undefined') && (adId !== null)) {
			// VIP
			return [topKeywordFunction, trendingKeywordFunction, suggestedKeywordFunction];
		} else {
			// Homepage
			return [topKeywordFunction, trendingKeywordFunction];
		}
	}
}

module.exports = KeywordModel;
