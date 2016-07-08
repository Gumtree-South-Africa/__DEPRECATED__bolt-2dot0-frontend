'use strict';

let $ = require('jquery');

let initialize = () => {
	function toggleBrowseMenu(event) {
		console.log(event.target);
		$('.js-cat-dropdown').toggleClass('hidden');
		$(".browse .item-text").toggleClass('menu-open');
	}

	$(document).ready(() => {
		$('.browse').on('tap', toggleBrowseMenu)
			.hover(toggleBrowseMenu, toggleBrowseMenu);
	});
};

module.exports = {
	initialize
};

