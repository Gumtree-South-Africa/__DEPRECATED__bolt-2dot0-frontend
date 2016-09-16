'use strict';

let cwd = process.cwd();
let editAdService = require(cwd + '/server/services/editad');

let VIP_URL_SUFFIX = "?activateStatus=adEdited";


class EditAdModel {
	constructor(bapiHeaders, prodEpsMode) {
		this.bapiHeaders = bapiHeaders;
		this.prodEpsMode = prodEpsMode;
	}

	translateTimeToReadable(data) {
		let postDate = new Date(data.postedDate);
		let currentDate = new Date();
		let timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
		let diffHrs =  Math.floor(timeDiff / (1000 * 60 * 60));// hours
		let diffMins = Math.floor(timeDiff / (1000 * 60)).toFixed(1);

		if (diffMins < 60) {
			let pluralizationString = diffMins === 1 ? "singular" : "plural";
			data.timeUntil = Math.round(diffMins);
			data.dateStringKey = `shareAd.dateStrings.minute.${pluralizationString}`;
		} else if (diffHrs < 24) {
			let pluralizationString = diffHrs === 1 ? "singular" : "plural";
			data.timeUntil = Math.round(diffHrs);
			data.dateStringKey = `shareAd.dateStrings.hour.${pluralizationString}`;
		} else {
			data.timeUntil = null;
			data.dateStringKey = null;
			data.datePosted = postDate;
		}

		data.statistics = data.statistics || {};

		// defaulting to zero if it isnt returned
		data.statistics.viewCount = data.statistics.viewCount || 0;
		data.statistics.replyCount = data.statistics.replyCount || 0;
		data.statistics.favoriteCount = data.statistics.favoriteCount || 0;

		return data;
	}

	getAd(adId) {
		if (typeof adId === undefined || adId === null) {
			return {};
		}
		return editAdService.getAd(this.bapiHeaders, adId).then(this.translateTimeToReadable).then((data) => {
			// replacing new line characters with the line feed html entity so that spaces
			// arent injected into the text area
			data.description = data.description.replace(/\n/g, "&#10;");

			if (!this.prodEpsMode) {
				data = JSON.parse(JSON.stringify(data).replace(/i\.ebayimg\.sandbox\.ebay\.com/g, 'i.sandbox.ebayimg.com'));
			}
			return data;
		});
	}

	editAd(editAdRequest) {
		return editAdService.editAd(this.bapiHeaders, editAdRequest.adId, editAdRequest).then( (results) => {
			let vipLink = results._links.find( (elt) => {
				return elt.rel === "seoVipUrl";
			});
			let paymentLink = results._links.find( (elt) => {
				return elt.rel === "paymentUrl";
			});
			let paymentRedirectLink = results._links.find( (elt) => {
				return elt.rel === "paymentRedirectUrl";
			});

			if (vipLink) {
				results.redirectLink = {
					vip: this.fixupVipUrl(vipLink.href),
					previp: paymentLink.href,
					previpRedirect: paymentRedirectLink.href
				};
			} else {
				throw new Error(`post ad result is missing seoVipUrl or paymentUrl ${JSON.stringify(results, null, 4)}`);
			}
			return results;
		});
	}

	 fixupVipUrl(redirectUrl) {
	 	return redirectUrl + VIP_URL_SUFFIX;
	 }
}

module.exports = EditAdModel;
