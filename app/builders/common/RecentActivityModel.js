'use strict';

let Q = require('q');

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');
let recentActivityConfig = require(process.cwd() + '/app/config/ui/recentActivityConfig.json');
let _ = require('underscore');
_.templateSettings = {
	interpolate: /\{([\s\S]+?)\}/g
};

class RecentActivityModel {
	constructor(bapiHeaderValues, prodEpsMode) {
		this.bapiHeaderValues = bapiHeaderValues;
		this.prodEpsMode = prodEpsMode;
	}

	isSold(feed) {
		return !(feed.action === 'LISTED');
	}

	filterArr(inputArr, locale) {
		let inputLocale = recentActivityConfig[locale];

		let res = _.reduceRight(inputArr, function(a, b) {
			let id = inputLocale[b['categoryId']];
			if (id) {
				let types = _.pluck(id.type, 'name'),
					attributes = [],
					prefix;
				_.each(b.attributes, function(e) {
					if (_.contains(types, e.name)) {
						prefix = _.template(_.findWhere(id.type, {name: e.name}).prefix);
						e.prefix = prefix({'formattedValue': e.formattedValue, 'localizedName': e.localizedName});
						attributes.push(e);
					}
				}, []);

				if (attributes.length) {
					b.attributes = attributes;
					a.push(b);
				}
			}
			return a;
		}, []);
		return res;
	}

	shuffleArr(inputArr) {
		for (let i = inputArr.length - 1; i >= 0; i--) {
			let randomIndex = Math.floor(Math.random() * (i + 1));
			let itemAtIndex = inputArr[randomIndex];

			inputArr[randomIndex] = inputArr[i];
			inputArr[i] = itemAtIndex;
		}

		if (!this.prodEpsMode) {
			inputArr = JSON.parse(JSON.stringify(inputArr).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
		}

		return inputArr;
	}

	getRecentActivities(geoLatLngObj) {
		return recentActivityService.getRecentActivities(this.bapiHeaderValues, geoLatLngObj).then((bapiResult) => {
			bapiResult.recent = [];
			bapiResult.filteredArr = this.filterArr(bapiResult.ads, this.bapiHeaderValues.locale) || [];
			console.log(JSON.stringify(bapiResult.ads, null, 2));

			if (bapiResult.filteredArr.length > 2) {
				bapiResult.shuffledArr = this.shuffleArr(bapiResult.filteredArr) || [];
				// bapiResult.shuffledArr = bapiResult.filteredArr;
			}

			return bapiResult;
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
}

module.exports = RecentActivityModel;
