'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");
let $ = require('jquery');
require("jquery-lazyload");


class AdTile {

	/**
	 * favorite the ad (to the server, assume user is logged in)
	 * @param adId
	 * @param success
	 * @param error
	 * @private
	 */

	_favoriteAd(method, adId, success, error) {
		$.ajax({
			url: '/api/ads/favorite',
			type: method,
			data: {
				"adId": adId
			},
			success: success,
			error: error
		});
	}

	getCookieFavoriteIds() {
		let cookie = CookieUtils.getCookie('watchlist');
		if (!cookie) {
			return [];
		}
		return cookie.split(',');
	}

	toggleFavorite(tile) {
		$(tile).toggleClass("icon-heart-gray icon-heart-white");
	}

	_getIdMapFromCookie(cookieName) {
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
	}

	_setIdMapToCookie(cookieName, map) {
		let cookieValue = Object.getOwnPropertyNames(map).join(',');
		CookieUtils.setCookie(cookieName, cookieValue, 10000);
		return cookieValue;
	}

	onFavoriteClick(event) {
		let target = $(event.target);

		// we change the visual state right away so user sees it, assuming we'll succeed, but we could fail...
		target.toggleClass("icon-heart-gray icon-heart-white");

		let ids = this._getIdMapFromCookie('watchlist');
		let adId = target.data('adid');  // data attrs get lower-cased

		let action;
		if (target.hasClass("icon-heart-white")) {

			// add to cookie
			ids[adId] = '';
			this._setIdMapToCookie('watchlist', ids);

			// add to server
			action = "POST";
		} else {

			// delete from cookie
			delete ids[adId];
			this._setIdMapToCookie('watchlist', ids);

			// remove from server
			action = "DELETE";
		}

		if (CookieUtils.getCookie('bt_auth')) {
			// console.log("user has auth cookie");

			// perform server action, only if we have a bt_auth cookie
			this._favoriteAd(action, adId
				,() => {
					// console.log(`${action} success`);
				},
				(/*res*/) => {
					// there is no UX for a failure here, we just ignore any issues
					// console.log(`${action} fail ${JSON.stringify(res, null, 4)}`);
				}
			);
		}
	}

	/**
	 * onReady - separated out for easy testing
	 */
	onReady() {
		this.$lazyImage.lazyload({
			"skip_invisible": true
		});

		// this.$lazyImage.on("appear", () => {
		// 	console.log("appear");
		// });

		// update/set watchlist cookie when user 'favorites' an ad
		this.$favoriteButton.click((evt) => {
			// push the click through without changing
			// the scope of this
			this.onFavoriteClick(evt);
		});
	}

	/**
	 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
	 * @param registerOnReady
	 */
	initialize(registerOnReady = true) {
		this.$tile = $('.panel');
		this.$favoriteButton = this.$tile.find('.favorite-btn');
		this.$lazyImage = this.$tile.find('img.lazy');

		if (registerOnReady) {
			$(document).ready(this.onReady.bind(this));	// need special bind here
		}
	}

}


module.exports = new AdTile();
