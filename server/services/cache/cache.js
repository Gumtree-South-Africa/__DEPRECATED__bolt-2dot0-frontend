/**
 * Created by vrajendiran on 8/11/16.
 */
'use strict';

let LRU = require("lru-cache");
let config = require('config');


class CacheService {

	constructor() {
		let options =
			{
				max: 2500,
				length: function(n) {
					return n.length;
				},
				dispose: function(key, n) {
					n.close();
				},
				maxAge: 1000 * 60 * 60
			};
		this.cache = LRU(options);
		this.otherCache = LRU(50);

		this.cache.reset();
	}

	peekValueFromCache(cacheKey) {
		this.cache.peek(cacheKey);
	}

	getValueFromCache(cacheKey) {
		this.cache.get(cacheKey);
	}

	setValueInCache(cacheKey, cacheValue, cacheTimeConfigKey) {
		if (typeof cacheTimeConfigKey === 'undefined' || cacheTimeConfigKey === null) {
			this.cache.set(cacheKey, cacheValue);
		} else {
			let cacheTimeConfigValue = config.get(cacheTimeConfigKey);
			this.cache.set(cacheKey, cacheValue, cacheTimeConfigValue);
		}
	}

}

module.exports = new CacheService();
