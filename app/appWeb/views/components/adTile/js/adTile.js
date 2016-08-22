'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");
let $ = require('jquery');
require("jquery-lazyload");

/**
 * favorite the ad (to the server, assume user is logged in)
 * @param adId
 * @param success
 * @param error
 * @private
 */
let _favoriteAd = (method, adId, success, error) => {
	$.ajax({
		url: '/api/ads/favorite',
		type: method,
		data: {
			"adId": adId
		},
		success: success,
		error: error
	});
};

let _getIdMapFromCookie = (cookieName) => {
	let cookie = CookieUtils.getCookie(cookieName);
	if (!cookie) {
		return {};
	}
	let ids = cookie.split(',');
	let map = {};
	for (let i = 0; i < ids.length; i++) {
		map[ids[i]] = '';	// dont care about the values
	}
	return map;
};

let _setIdMapToCookie = (cookieName, map) => {
	let cookieValue = Object.getOwnPropertyNames(map).join(',');
	CookieUtils.setCookie(cookieName, cookieValue, 10000);
	return cookieValue;
};

let onFavoriteClick = (event) => {
	let target = $(event.target);

	// we change the visual state right away so user sees it, assuming we'll succeed, but we could fail...
	target.toggleClass("icon-heart-gray icon-heart-white");

	let ids = _getIdMapFromCookie('watchlist');
	let adId = target.data('adid');  // data attrs get lower-cased

	let action;
	if (target.hasClass("icon-heart-white")) {

		// add to cookie
		ids[adId] = '';
		_setIdMapToCookie('watchlist', ids);

		// add to server
		action = "POST";
	} else {

		// delete from cookie
		delete ids[adId];
		_setIdMapToCookie('watchlist', ids);

		// remove from server
		action = "DELETE";
	}

	if (CookieUtils.getCookie('bt_auth')) {
		// console.log("user has auth cookie");

		// perform server action, only if we have a bt_auth cookie
		_favoriteAd(action, adId
			,() => {
				// console.log(`${action} success`);
			},
			(/*res*/) => {
				// there is no UX for a failure here, we just ignore any issues
				// console.log(`${action} fail ${JSON.stringify(res, null, 4)}`);
			}
		);
	}


};

/**
 * onReady - separated out for easy testing
 */
let onReady = () => {
	this.$lazyImage.lazyload({
		"skip_invisible": true
	});

	// this.$lazyImage.on("appear", () => {
	// 	console.log("appear");
	// });

	// update/set watchlist cookie when user 'favorites' an ad
	this.$favoriteButton.click(onFavoriteClick);
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
	_favoriteAd, 			// expose for testing
	_getIdMapFromCookie, 	// expose for testing
	_setIdMapToCookie,		// expose for testing
	onReady, 				// expose for testing
	initialize
};
