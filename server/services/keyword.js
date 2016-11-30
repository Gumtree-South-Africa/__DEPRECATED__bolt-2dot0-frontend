'use strict';

let config = require('config');
let bapiOptionsModel = require('./bapi/bapiOptionsModel');
let bapiService      = require('./bapi/bapiService');

/**
 * @description A service class that talks to Keyword BAPI
 * @constructor
 */
class KeywordService {

	/**
	 * Gets a list of top keywords
	 */
	getTopKeywordsData(bapiHeaderValues, adId, kwCount) {
		let queryEndpoint = config.get('BAPI.endpoints.topKeywords');
		let apiParameters = {};
		if ((typeof adId !== 'undefined') && (adId !== null)) {
			apiParameters.adId = adId;
		}
		if ((typeof kwCount !== 'undefined') && (kwCount !== null)) {
			apiParameters.limit = kwCount;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters,
		}), bapiHeaderValues, 'keywordService$topKeywords');
	}

	/**
	 * Gets a list of trending keywords
	 */
	getTrendingKeywordsData(bapiHeaderValues, adId, kwCount) {
		let queryEndpoint = config.get('BAPI.endpoints.trendingKeywords');
		let apiParameters = {};
		if ((typeof adId !== 'undefined') && (adId !== null)) {
			apiParameters.adId = adId;
		}
		if ((typeof kwCount !== 'undefined') && (kwCount !== null)) {
			apiParameters.limit = kwCount;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters,
		}), bapiHeaderValues, 'keywordService$trendingKeywords');
	}

	/**
	 * Gets a list of suggested keywords
	 */
	getSuggestedKeywordsData(bapiHeaderValues, adId, kwCount) {
		let queryEndpoint = config.get('BAPI.endpoints.suggestedKeywords');
		let apiParameters = {};
		if ((typeof adId !== 'undefined') && (adId !== null)) {
			apiParameters.adId = adId;
		}
		if ((typeof kwCount !== 'undefined') && (kwCount !== null)) {
			apiParameters.limit = kwCount;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters,
		}), bapiHeaderValues, 'keywordService$suggestedKeywords');
	}

	/**
	 * Gets a list of related keywords
	 */
	getRelatedKeywordsData(bapiHeaderValues, adId, kwCount) {
		let queryEndpoint = config.get('BAPI.endpoints.relatedKeywords');
		let apiParameters = {};
		if ((typeof adId !== 'undefined') && (adId !== null)) {
			apiParameters.adId = adId;
		}
		if ((typeof kwCount !== 'undefined') && (kwCount !== null)) {
			apiParameters.limit = kwCount;
		}

		return bapiService.bapiPromiseGet(bapiOptionsModel.initFromConfig(config, {
			method: 'GET',
			path: queryEndpoint,
			extraParameters: apiParameters,
		}), bapiHeaderValues, 'keywordService$relatedKeywords');
	}
}

module.exports = new KeywordService();
