'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");



class AdDetails {

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

	/**
	 * get the favorite IDs from the cookie
	 * public, for example the tile grid uses this
	 * because its public, the cookie name is abtracted from the caller intentionally
	 */
	getCookieFavoriteIds() {
		let cookie = CookieUtils.getCookie('watchlist');
		if (!cookie) {
			return [];
		}
		// V1 watchlist cookie has the commas encoded, we need to be compatible so we use decodeURIComponent
		return decodeURIComponent(cookie.replace(/\"/g,'')).split(',');
	}

	/**
	 * toggle the state from favorite to non and visa versa
	 * public, for use by the tile grid
	 * @param tile
	 */
	toggleFavorite(favoriteButton) {
		$(favoriteButton).toggleClass("icon-heart-gray icon-heart-orange");
	}

	/**
	 * extracts a map (of keys) from a cookie,
	 * using a map to help prevent duplicates and simplify add/remove
	 * @returns {{object}} map
	 * @private
	 */
	_getIdMapFromCookie() {
		let ids = this.getCookieFavoriteIds();
		if (ids.length === 0) {
			return {};
		}
		let map = {};
		for (let i = 0; i < ids.length; i++) {
			map[ids[i]] = '';	// dont care about the values
		}
		return map;
	}

	/**
	 * Take the map (of keys) and store into a cookie (comma separated keys only)
	 * @param cookieName
	 * @param map
	 * @returns {string} the map keys reduced to storage format: comma separated string (useful in testing)
	 * @private
	 */
	_setIdMapToCookie(map) {
		// V1 watchlist cookie has the commas encoded, we need to be compatible so we use encodeURIComponent
		let cookieValue = encodeURIComponent(Object.keys(map).join(','));

		CookieUtils.setCookie('watchlist', cookieValue, 10000);
		return cookieValue;
	}

	/**
	 * Favorite Click to toggle the state of a favorite,
	 * saved to both cookie and server (when bt_auth present)
	 * @param event
	 * @private
	 */
	_onFavoriteClick(event) {
		let target = $(event.target);

		// get long ad id
		let adId = target.data('adid');  // using attribute data-adid;
		if (!adId) {
			console.warn("unable to favorite item, missing ad id");
			return;
		}

		// use short ad id for cookie to be compatible with RUI
		let shortAdId = target.data('short-adid');	// using attribute data-short-adid
		if (!shortAdId) {
			console.warn("unable to favorite item, missing short ad id");
			return;
		}

		this.toggleFavorite(target);

		// get list of ids from cookie
		let ids = this._getIdMapFromCookie('watchlist');
		let action;
		if (target.hasClass("icon-heart-orange")) {

			// add to cookie
			ids[shortAdId] = '';
			this._setIdMapToCookie(ids);

			// add to server
			action = "POST";
		} else {

			// delete from cookie
			delete ids[shortAdId];
			this._setIdMapToCookie(ids);

			// remove from server
			action = "DELETE";
		}

		// perform server action, prefer to do this only if we have a bt_auth cookie, but bt_auth is httpOnly
		// if there is another cookie we could rely on for logged in check we could use that, for now we call no matter what
		this._favoriteAd(action, adId
			,() => {
				// no action on success
			},
			(/*res*/) => {
				// there is no UX for a failure here, we just ignore any issues
			}
		);

	}

	/**
	 * onReady - separated out for easy testing
	 */
	onReady() {
		let $favoriteButton = $('.favorite-icon');
		$favoriteButton.click((evt) => {
			this._onFavoriteClick(evt);
		});

		let shortAdId = $favoriteButton.data('short-adid');	// using attribute data-short-adid
		let ids = this._getIdMapFromCookie('watchlist');

		// since another tile could have the same id (the same tile in two separate cards), toggle them all
		if (ids[shortAdId] !== undefined) {
			this.toggleFavorite($favoriteButton);
		}
	}

	/**
	 * Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
	 * @param registerOnReady
	 */
	initialize(registerOnReady = true) {
		if (registerOnReady) {
			$(document).ready(this.onReady.bind(this));	// need special bind here
		}
	}

}


module.exports = new AdDetails();
