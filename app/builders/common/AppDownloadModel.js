'use strict';

let deviceDetection = require(process.cwd() + '/modules/device-detection');

class AppDownloadModel {
	constructor(req, res) {
		this.req = req;
		this.res = res;
	}

	getAppDownload() {

		let bapiConfigData = this.res.locals.config.bapiConfigData;

		let reviews = bapiConfigData.content.homepageV2.reviews; //array
		let numOfAdsToSend;

		if (deviceDetection.isMobile()) {
			numOfAdsToSend = 1;
		} else {
			numOfAdsToSend = 3;
		}

		let randomReviews = new Array(numOfAdsToSend)
			, randomIndexList = new Array(numOfAdsToSend)
			, totalNumOfAds = reviews.length
			, i = 0, ridx, j;

		while (i < numOfAdsToSend) {
			ridx = Math.floor(Math.random() * totalNumOfAds);
			if ((randomIndexList[i - 1] !== ridx) && (randomIndexList[i - 2] !== ridx)) {
				randomIndexList[i] = ridx;
				i++;
			}
		}
		for (j = 0; j < numOfAdsToSend; j++) {
			randomReviews[j] = reviews[randomIndexList[j]];
		}

		return randomReviews.map((review) => {
			return {
				primaryImageUrl: `${this.res.locals.config.locale}/reviews/${review.primaryImageUrl}`,
				description: review.description,
				rating: review.rating
			};
		});

	}
}
module.exports = AppDownloadModel;
