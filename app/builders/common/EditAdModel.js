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
		let bapiRequestJson = this.mapToBapiRequest(editAdRequest);

		return editAdService.editAd(this.bapiHeaders, editAdRequest.id, bapiRequestJson).then( (results) => {
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

	// front end request structure is different than the back end:
	// front end has array of ads, back end only supports one ad
	// front end imageUrls is array of urls, back end is more complex
	mapToBapiRequest(editAdRequest) {
		let result = JSON.parse(JSON.stringify(editAdRequest));	// deep clone the structure

		// RAML has changed to accept an array of imageUrl, but not yet implemented
		result.ads.forEach((ad, index) => {
			ad.pictures = {};
			let pictures = editAdRequest.ads[index].imageUrls;
			ad.pictures.sizeUrls = {
				'LARGE' : pictures[0]
			};
		});

		return result.ads[0];	// bapi currently only supports one ad
	}

	fixupVipUrl(redirectUrl) {
		return redirectUrl + VIP_URL_SUFFIX;
	}
}

module.exports = EditAdModel;
