'use strict';

let cwd = process.cwd();
let editAdService = require(cwd + '/server/services/editad');

// let VIP_URL_SUFFIX = "?activateStatus=adActivateSuccess";


class EditAdModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getAd(adId) {
		if (typeof adId === undefined || adId === null) {
			return {};
		}
		return editAdService.getAd(this.bapiHeaders, adId).then((data) => {
			let postDate = new Date(data.postedDate);
			let currentDate = new Date();
			let timeDiff = Math.abs(currentDate.getTime() - postDate.getTime());
			var diffHrs =  Math.floor(timeDiff / (1000 * 60 * 60));// hours
			var diffMins = Math.floor(timeDiff / (1000 * 60)).toFixed(1);

			if (diffMins < 60) {
				let pluralizationString = diffMins === 1 ? "singular" : "plural";
				data.timeUntil = diffMins;
				data.dateStringKey = `shareAd.dateStrings.minute.${pluralizationString}`
			} else if (diffHrs < 24) {
				let pluralizationString = diffHrs === 1 ? "singular" : "plural";
				data.timeUntil = diffHrs;
				data.dateStringKey = `shareAd.dateStrings.hour.${pluralizationString}`
			} else {
				data.timeUntil = null;
				data.dateStringKey = null;
				data.datePosted = postDate;
			}

			return data;
		});
	}

	editAd(editAdRequest) {
		return editAdService.editAd(this.bapiHeaders, editAdRequest.adId, editAdRequest).then( (results) => {
			let vipLink = results._links.find( (elt) => {
				return elt.rel === "seoVipUrl";
			});
			if (vipLink) {
				results.vipLink = vipLink.href;
			} else {
				throw new Error(`post ad result is missing seoVipUrl ${JSON.stringify(results, null, 4)}`);
			}
			return results;
		});
	}

	// fixupVipUrl(redirectUrl) {
	// 	return redirectUrl + VIP_URL_SUFFIX;
	// }
}

module.exports = EditAdModel;
