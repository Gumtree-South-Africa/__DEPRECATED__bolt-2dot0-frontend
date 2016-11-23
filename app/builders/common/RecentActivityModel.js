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
				let attributes = [], prefix;
				id.type.forEach(t => {
					let foundAttribute = b.attributes.find(at => at.name === t.name);

					if (foundAttribute) {
						prefix = _.template(t.prefix);
						foundAttribute.prefix = prefix({
							'formattedValue': foundAttribute.formattedValue,
							'localizedName': foundAttribute.localizedName
						});
						attributes.push(foundAttribute);
					}
				});

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

		if (!this.prodEpsMode) {
			inputArr = JSON.parse(JSON.stringify(inputArr).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
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
