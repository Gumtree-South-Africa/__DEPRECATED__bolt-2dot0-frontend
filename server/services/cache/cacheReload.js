/**
 * Created by vrajendiran on 8/11/16.
 */
'use strict';

let _ = require('underscore');
let cuid = require('cuid');
let NanoTimer = require('nanotimer');

let cacheService = require(process.cwd() + "/server/services/cache/cacheService");
let cacheConfig = require(process.cwd() + '/server/config/site/cacheConfig.json');


class CacheReloader {

	constructor() {
		this.cacheReloadable = [];

		_.each(cacheConfig.cache, (cache) => {
			if (cache.reload !== undefined) {
				this.cacheReloadable.push(cache);
			}
		});
	}

	kickoffReloadProcess(bapiHeaders) {
		let promises = [];
		_.each(this.cacheReloadable, (cache) => {
			// Set Cache
			bapiHeaders.requestId = 'cache$' + cuid();
			promises.push(this.refreshCache(cache, bapiHeaders));

			// Setup Timer to Reload Cache
			let timer = new NanoTimer();
			let interval = cache.reload + 'm';
			timer.setInterval(this.refreshCache, [cache, bapiHeaders], interval);
		});
		return promises;
	}

	refreshCache(cache, bapiHeaders) {
		let service = require(process.cwd() + cache.service);
		let method = cache.method;

		return service[method](bapiHeaders).then((data) => {
			return cacheService.setValue(cache.name, bapiHeaders.locale, data).fail((err) => {
				console.warn(err);
			});
		});
	}

}

module.exports = new CacheReloader();
