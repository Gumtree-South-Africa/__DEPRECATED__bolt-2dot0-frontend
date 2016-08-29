'use strict';

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');
let recentActivityConfig = require(process.cwd() + '/app/config/ui/recentActivityConfig.json');
let _ = require('underscore');
_.templateSettings = {
	interpolate: /\{([\s\S]+?)\}/g
};

class RecentActivityModel {
	constructor(bapiHeaderValues) {
		this.bapiHeaderValues = bapiHeaderValues;
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

				if (attributes.length && b.seller.profileImage !== undefined) {
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
		return inputArr;
	}

	getRecentActivities(geoLatLngObj) {
		return recentActivityService.getRecentActivities(this.bapiHeaderValues, geoLatLngObj).then((bapiResult) => {
			bapiResult.recent = [];
			bapiResult.filteredArr = this.filterArr(bapiResult.ads, this.bapiHeaderValues.locale) || [];

			if (bapiResult.filteredArr.length > 2) {
				bapiResult.shuffledArr = this.shuffleArr(bapiResult.filteredArr) || [];
			}

			return bapiResult;
		}).fail((bapiErr) => {
			console.warn(`Error getting BAPI recentActivities data ${bapiErr}`);
			return recentActivityService.getCachedRecentActivities(this.bapiHeaderValues).then((cachedResult) => {
				cachedResult = (cachedResult !== undefined) ? cachedResult : {};
				return this.transformData(cachedResult);
			}).fail((cacheErr) => {
				if (cacheErr.status) {
					console.warn(cacheErr.message);
				} else {
					console.warn(`Error getting Cache recentActivities data ${cacheErr}`);
				}
				return {};
			});
		});
	}
}

module.exports = RecentActivityModel;
