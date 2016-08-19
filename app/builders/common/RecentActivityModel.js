'use strict';

let Q = require('q');

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');

class RecentActivityModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
	}

	getPrefix1(feed) {
		return feed.action;
	}

	getPrefix2(feed) {
		return feed.action;
	}

	isSold(feed) {
		return !(feed.action === 'LISTED');
	}

	getRecentActivities(geoLatLngObj) {
		return recentActivityService.getRecentActivities(this.bapiHeaderValues, geoLatLngObj).then((bapiResult) => {
			return this.transformData(bapiResult);
		}).fail((bapiErr) => {
			console.warn(`Error getting BAPI recentActivities data ${bapiErr}, going to try to get it from cache`);
			return recentActivityService.getCachedRecentActivities(this.bapiHeaderValues).then((cachedResult) => {
				cachedResult = (cachedResult !== undefined) ? cachedResult : {};
				return this.transformData(cachedResult);
			}).fail((cacheErr) => {
				if (cacheErr.status) {
					return Q.reject(cacheErr.message);
				} else {
					return Q.reject(`Error getting Cache recentActivities data ${cacheErr}`);
				}
			});
		});
	}

	transformData(data) {
		data.recent = [];

		if (data.ads instanceof Array && data.ads.length>0) {
			let feed1 = data.ads[Math.floor(Math.random() * data.ads.length)];
			feed1.renderSold = this.isSold(feed1);
			feed1.prefix1 = '11';
			feed1.prefix2 = '12';
			data.recent.push(feed1);

			let feed2 = data.ads[Math.floor(Math.random() * data.ads.length)];
			feed2.renderSold = this.isSold(feed2);
			feed2.prefix1 = '21';
			feed2.prefix2 = '22';
			data.recent.push(feed2);

			let feed3 = data.ads[Math.floor(Math.random() * data.ads.length)];
			feed3.renderSold = this.isSold(feed3);
			feed3.prefix1 = '31';
			feed3.prefix2 = '32';
			data.recent.push(feed3);
		}

		return data;
	}
}

module.exports = RecentActivityModel;
