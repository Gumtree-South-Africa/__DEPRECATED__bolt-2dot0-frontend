/**
 * Created by vrajendiran on 8/11/16.
 */
'use strict';

let Q = require('q');
let cache = require('./cache');


class CacheService {

	peekValue(cacheName, cacheKey) {
		console.time('Instrument-Cache-PEEK-' + cacheName + ' ' + cacheKey);
		let deferred = Q.defer();
		let value = cache.peekValueFromCache(cacheName, cacheKey);
		deferred.resolve(value);
		console.timeEnd('Instrument-Cache-PEEK-' + cacheName + ' ' + cacheKey);
		return deferred.promise;
	}

	getValue(cacheName, cacheKey) {
		console.time('Instrument-Cache-GET-' + cacheName + ' ' + cacheKey);
		let deferred = Q.defer();
		let value = cache.getValueFromCache(cacheName, cacheKey);
		deferred.resolve(value);
		console.timeEnd('Instrument-Cache-GET-' + cacheName + ' ' + cacheKey);
		return deferred.promise;
	}

	setValue(cacheName, cacheKey, cacheValue, cacheTimeConfig) {
		console.time('Instrument-Cache-SET-' + cacheName + ' ' + cacheKey);
		cache.setValueInCache(cacheName, cacheKey, cacheValue, cacheTimeConfig);
		console.timeEnd('Instrument-Cache-SET-' + cacheName + ' ' + cacheKey);
	}

}

module.exports = new CacheService();
