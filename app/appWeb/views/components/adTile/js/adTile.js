'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");
let $ = require('jquery');
require("jquery-lazyload");
let _postAdId = (adId) => {
	// POST newly added item
	$.ajax({
		url: '/api/ads/favorite',
		type: 'POST',
		data: {
			"adId": adId
		},
		success: (res) => {
			console.log('POST success!');
			console.log(res);
		},
		error: (res) => {
			console.log('POST failure!');
			console.log(res);
		}
	});
};

let onReady = () => {
	this.$lazyImage.lazyload({
		"skip_invisible": true
	});

	this.$lazyImage.on("appear", () => {
		console.log("appear");
	});

	// update/set watchlist cookie when user 'favorites' an ad
	this.$favoriteButton.click((event) => {
		let target = $(event.target);
		target.toggleClass("icon-heart-gray");
		target.toggleClass("icon-heart-white");

		// if tile is now active, add it to favorites
		if (target.hasClass("icon-heart-white")) {
			let cookie = CookieUtils.getCookie('watchlist');
			let adId = target.data('adid');  // data attrs get lower-cased
			if (cookie) {
				// update existing
				CookieUtils.setCookie('watchlist', cookie + "," + adId, 10000);
			} else {
				// create new
				CookieUtils.setCookie('watchlist', adId, 10000);
			}

			_postAdId(adId);
		} else { // remove otherwise
			// TODO - remove adId from cookie
		}
	});
};

/**
 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
 * @param registerOnReady
 */
let initialize = (registerOnReady = true) => {

	this.$tile = $('.panel');
	this.$favoriteButton = this.$tile.find('.favorite-btn');
	this.$lazyImage = this.$tile.find('img.lazy');

	if (registerOnReady) {
		$(document).ready(onReady);
	}
};

module.exports = {
	onReady, 	// expose for testing
	initialize
};
