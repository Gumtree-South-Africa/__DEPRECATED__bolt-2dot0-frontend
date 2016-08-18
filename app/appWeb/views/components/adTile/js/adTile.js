'use strict';

let $ = require('jquery');
require("jquery-lazyload");

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
