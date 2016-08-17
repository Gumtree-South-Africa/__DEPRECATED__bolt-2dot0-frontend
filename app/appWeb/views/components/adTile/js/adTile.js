'use strict';

let $ = require('jquery');
require("jquery-lazyload");

let initialize = () => {
	$(document).ready(() => {
		$("img.lazy").lazyload({
			"skip_invisible": true
		});

		$("img.lazy").on("appear", () => {
			console.log("appear");
		});

		// update/set watchlist cookie when user 'favorites' an ad
		$(".trending-card .favorite-btn").click((event) => {
			let target = $(event.target);
			target.toggleClass("icon-heart-gray");
			target.toggleClass("icon-heart-white");
		});
	});
};

module.exports = {
	initialize
};
