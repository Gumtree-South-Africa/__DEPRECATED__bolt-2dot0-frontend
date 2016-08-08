'use strict';

let cwd = process.cwd();
let postAdService = require(cwd + '/server/services/postad');


class PostAdModel {
	constructor(bapiHeaders) {
		this.bapiHeaders = bapiHeaders;
	}

	postAd(postAdRequest) {
		let bapiRequestJson = this.mapToBapiRequest(postAdRequest);

		return postAdService.quickpostAdMock(this.bapiHeaders, bapiRequestJson).then( (results) => {
			let vipLink = results._links.find( (elt) => {
				return elt.rel === "vipSeoUrl";
			});
			if (vipLink) {
				results.vipLink = vipLink.href;
			} else {
				throw new Error(`post ad result is missing vipSeoUrl ${JSON.stringify(results, null, 4)}`);
			}
			return results;
		});
	}

	// // front end request structure is different than the back end:
	// // front end has array of ads, back end only supports one ad
	// // front end imageUrls is array of urls, back end is more complex
	mapToBapiRequest(postAdRequest) {
		let result = JSON.parse(JSON.stringify(postAdRequest));	// deep clone the structure

		return result.ads[0];	// bapi currently only supports one ad
	}
}

module.exports = PostAdModel;
