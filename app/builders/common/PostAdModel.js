'use strict';

let cwd = process.cwd();
let postAdService = require(cwd + '/server/services/postad');

let VIP_URL_SUFFIX = "?activateStatus=adActivateSuccess";

class PostAdModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	postAd(postAdRequest) {
		let bapiRequestJson = this.mapToBapiRequest(postAdRequest);

		return postAdService.quickpost(this.bapiHeaders, bapiRequestJson).then( (results) => {
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
				results.redirectLinks = {
					vip: this.fixupVipUrl(vipLink.href),
					previp: paymentLink ? paymentLink.href : "",
					previpRedirect: paymentRedirectLink ? paymentRedirectLink.href : ""
				};
			} else {
				throw new Error(`post ad result is missing seoVipUrl ${JSON.stringify(results, null, 4)}`);
			}
			return results;
		});
	}

	// front end request structure is different than the back end:
	// front end has array of ads, back end only supports one ad
	// front end imageUrls is array of urls, back end is more complex
	mapToBapiRequest(postAdRequest) {
		let result = JSON.parse(JSON.stringify(postAdRequest));	// deep clone the structure

		// RAML has changed to accept an array of imageUrl, but not yet implemented
		result.ads.forEach((ad, index) => {
			ad.pictures = {};
			let pictures = postAdRequest.ads[index].imageUrls;
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

module.exports = PostAdModel;
