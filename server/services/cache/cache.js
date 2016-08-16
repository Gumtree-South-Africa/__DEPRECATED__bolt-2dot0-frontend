/**
 * Created by vrajendiran on 8/11/16.
 */
'use strict';

let LRU = require("lru-cache");

let cacheConfig = require('./server/config/site/cacheConfig.json');


class BoltCache {

	constructor() {
		this.cache = {};

		cacheConfig.cache.forEach((cache) => {
			this.prePoopulate(cache.name, cache.maxElements, cache.maxAge);
		});
	}

	prePoopulate(name, maxConfig, maxAgeConfig) {
		let options =
			{
				max: maxConfig,
				maxAge: maxAgeConfig,
				length: function(n) {
					return n.length;
				},
				dispose: function(key, n) {
					n.close();
				}
			};
		this.cache[name] = LRU(options);
		this.cache[name].reset();
	}

	peekValueFromCache(cacheName, cacheKey) {
		this.cache[cacheName].peek(cacheKey);
	}

	getValueFromCache(cacheName, cacheKey) {
		this.cache[cacheName].get(cacheKey);
	}

	setValueInCache(cacheName, cacheKey, cacheValue, cacheTimeConfig) {
		if (typeof cacheTimeConfig === 'undefined' || cacheTimeConfig === null) {
			this.cache[cacheName].set(cacheKey, cacheValue);
		} else {
			this.cache[cacheName].set(cacheKey, cacheValue, cacheTimeConfig);
		}
	}

}

module.exports = new BoltCache();
