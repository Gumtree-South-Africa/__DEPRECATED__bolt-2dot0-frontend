'use strict';

let ModelBuilder = require('./ModelBuilder');
let adService = require(process.cwd() + '/server/services/adService');

/**
 * @description A class that Handles the Advert Model
 * @constructor
 */
class AdvertModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getModelBuilder(adId) {
		return new ModelBuilder(this.viewTheAd(adId));
	}

	viewTheAd(adId) {
		let viewAdFunction = () => {
			return adService.viewAd(this.bapiHeaders, adId);
		};
		let viewAdFeaturesFunction = () => {
			return adService.viewAdFeatures(this.bapiHeaders, adId);
		};
		let viewAdStatisticsFunction = () => {
			return adService.viewAdStatistics(this.bapiHeaders, adId);
		};
		let viewAdSellerDetailsFunction = () => {
			return adService.viewAdSellerDetails(this.bapiHeaders, adId);
		};
		let viewAdSimilarsFunction = () => {
			return adService.viewAdSimilars(this.bapiHeaders, adId);
		};
		let viewAdSellerOthersFunction = () => {
			return adService.viewAdSellerOthers(this.bapiHeaders, adId);
		};
		let viewAdSeoUrlsFunction = () => {
			return adService.viewAdSeoUrls(this.bapiHeaders, adId);
		};
		let viewAdFlagsFunction = () => {
			return adService.viewAdFlags(this.bapiHeaders, adId);
		};

		return [viewAdFunction, viewAdFeaturesFunction, viewAdStatisticsFunction, viewAdSellerDetailsFunction, viewAdSimilarsFunction, viewAdSellerOthersFunction, viewAdSeoUrlsFunction, viewAdFlagsFunction];
	}

	favoriteTheAd(adId) {
		return adService.favoriteAd(this.bapiHeaders, adId);
	}

	unfavoriteTheAd(adId) {
		return adService.unfavoriteAd(this.bapiHeaders, adId);
	}

	decodeLongAdId(adId) {
		let elements = [];
		if ((typeof adId !== 'undefined') && (adId !== null)) {
			let endIndex = adId.length;
			let beginIndex = adId.length - 2;
			let versionLength = 3;
			while (beginIndex >= versionLength) {
				let length = parseInt(adId.substring(beginIndex, endIndex));
				endIndex -= 2;
				beginIndex -= length;
				elements.push(parseInt(adId.substring(beginIndex, endIndex)));
				endIndex = beginIndex;
				beginIndex = beginIndex - 2;
			}
			elements = elements.reverse();
		}
		return elements;
	}
}


module.exports = AdvertModel;

