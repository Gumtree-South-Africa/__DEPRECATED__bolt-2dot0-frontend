'use strict';

let adService = require(process.cwd() + '/server/services/adService');

/**
 * @description A class that Handles the Advert Model
 * @constructor
 */
class AdvertModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	favoriteTheAd(adId) {
		return adService.favoriteAd(this.bapiHeaders, adId).then((result) => {
			return result;
		});
	}

	unfavoriteTheAd(adId) {
		return adService.unfavoriteAd(this.bapiHeaders, adId).then((result) => {
			return result;
		});
	}
}


module.exports = AdvertModel;

