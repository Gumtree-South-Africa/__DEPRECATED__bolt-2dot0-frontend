/**
 * Created by vrajendiran on 8/11/16.
 */
'use strict';

let Q = require('q');
let cache = require('./cache');


class CacheService {

	peekValue(cacheName, cacheKey) {
		console.time('Instrument-Cache-PEEK-' + cacheName + ' ' + cacheKey);
		let value = cache.peekValueFromCache(cacheName, cacheKey);
		if (value === undefined) {
			return Q.reject({
				"status": 404,
				"message": "cache element " + cacheKey + " not found in cache " + cacheName
			});
		}
		console.timeEnd('Instrument-Cache-PEEK-' + cacheName + ' ' + cacheKey);
		return Q(value);
	}

	getValue(cacheName, cacheKey) {
		console.time('Instrument-Cache-GET-' + cacheName + ' ' + cacheKey);
		let value = cache.getValueFromCache(cacheName, cacheKey);
		if (value === undefined) {
			return Q.reject({
				"status": 404,
				"message": "cache element " + cacheKey + " not found in cache " + cacheName
			});
		}
		console.timeEnd('Instrument-Cache-GET-' + cacheName + ' ' + cacheKey);
		return Q(value);
	}

	setValue(cacheName, cacheKey, cacheValue, cacheTimeConfig) {
		console.time('Instrument-Cache-SET-' + cacheName + ' ' + cacheKey);
		cache.setValueInCache(cacheName, cacheKey, cacheValue, cacheTimeConfig);
		console.timeEnd('Instrument-Cache-SET-' + cacheName + ' ' + cacheKey);
		return Q();
	}

}

module.exports = new CacheService();
