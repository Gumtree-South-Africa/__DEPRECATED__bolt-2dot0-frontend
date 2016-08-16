/**
 * Created by vrajendiran on 8/11/16.
 */
'use strict';

let cache = require('./cache');


class CacheService {

	constructor() {

	}

	peekValue(cacheName, cacheKey) {
		console.time('Instrument-Cache-PEEK-' + cacheName);
		let value = cache.peekValueFromCache(cacheName, cacheKey);
		console.timeEnd('Instrument-Cache-PEEK-' + cacheName);
		return value;
	}

	getValue(cacheName, cacheKey) {
		console.time('Instrument-Cache-GET-' + cacheName);
		let value = cache.getValueFromCache(cacheName, cacheKey);
		console.timeEnd('Instrument-Cache-GET-' + cacheName);
		return value;
	}

	setValue(cacheName, cacheKey, cacheValue, cacheTimeConfig) {
		console.time('Instrument-Cache-SET-' + cacheName);
		cache.setValueInCache(cacheName, cacheKey, cacheValue, cacheTimeConfig);
		console.timeEnd('Instrument-Cache-SET-' + cacheName);
	}

}

module.exports = new CacheService();
