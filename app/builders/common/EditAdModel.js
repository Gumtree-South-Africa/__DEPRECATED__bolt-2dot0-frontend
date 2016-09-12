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
			data.daysUntil = Math.ceil(timeDiff / (1000 * 3600 * 24));

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
					vip: vipLink.href,
					previp: paymentLink.href,
					previpRedirect: paymentRedirectLink.href
				};
			} else {
				throw new Error(`post ad result is missing seoVipUrl or paymentUrl ${JSON.stringify(results, null, 4)}`);
			}
			return results;
		});
	}

	// fixupVipUrl(redirectUrl) {
	// 	return redirectUrl + VIP_URL_SUFFIX;
	// }
}

module.exports = EditAdModel;
