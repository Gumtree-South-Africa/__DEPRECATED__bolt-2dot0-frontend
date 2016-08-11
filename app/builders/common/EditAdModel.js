'use strict';

let cwd = process.cwd();
let editAdService = require(cwd + '/server/services/editad');

let VIP_URL_SUFFIX = "?activateStatus=adActivateSuccess";

class EditAdModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	getAd(adId) {
		if (typeof adId === undefined || adId === null) {
			return {};
		}
		return editAdService.getAd(this.bapiHeaders, adId);
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

	fixupVipUrl(redirectUrl) {
		return redirectUrl + VIP_URL_SUFFIX;
	}
}

module.exports = EditAdModel;
