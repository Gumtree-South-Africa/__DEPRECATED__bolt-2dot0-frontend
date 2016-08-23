'use strict';

let recentActivityService = require(process.cwd() + '/server/services/recentactivity');
let recentActivityConfig = require(process.cwd() + '/app/config/ui/recentActivityConfig.json');
let _ = require('underscore');
_.templateSettings = {
	interpolate : /\{([\s\S]+?)\}/g
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
			let id=inputLocale[b['categoryId']];
			if(id) {
				let types = _.pluck(id.type, 'name'),
					attributes = [],
					prefix;
				_.each(b.attributes, function(e) {
					if(_.contains(types, e.name)) {
						prefix = _.template(_.findWhere(id.type, {name: e.name}).prefix);
						e.prefix = prefix({'formattedValue': e.formattedValue, 'localizedName': e.localizedName});
						attributes.push(e);
					}
				}, []);

				if(attributes.length) {
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
			bapiResult.filteredArr = [];
			bapiResult.shuffledArr = [];
			bapiResult.filteredArr = this.filterArr(bapiResult.ads, this.bapiHeaderValues.locale);
			bapiResult.shuffledArr = this.shuffleArr(bapiResult.filteredArr);

			if (bapiResult.shuffledArr instanceof Array && bapiResult.shuffledArr.length > 2) {
				let feed1 = bapiResult.shuffledArr[0];
				feed1.renderSold = this.isSold(feed1);
				feed1.prefix1 = feed1.attributes[0].prefix;
				feed1.prefix2 = feed1.attributes[1] ? feed1.attributes[1].prefix : '';
				bapiResult.recent.push(feed1);

				let feed2 = bapiResult.shuffledArr[1];
				feed2.renderSold = this.isSold(feed2);
				feed2.prefix1 = feed2.attributes[0].prefix;
				feed2.prefix2 = feed2.attributes[1] ? feed2.attributes[1].prefix : '';
				bapiResult.recent.push(feed2);

				let feed3 = bapiResult.shuffledArr[2];
				feed3.renderSold = this.isSold(feed3);
				feed3.prefix1 = feed3.attributes[0].prefix;
				feed3.prefix2 = feed3.attributes[1] ? feed3.attributes[1].prefix : '';
				bapiResult.recent.push(feed3);
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
