'use strict';

let $ = require('jquery');

let initialize = () => {
	function toggleBrowseMenu() {
		$('.js-cat-dropdown').toggleClass('hidden');
		$(".browse .item-text").toggleClass('menu-open');
		$('.header-item-icon').toggleClass('icon-down');
		$('.header-item-icon').toggleClass('icon-up');
	}

	$(document).ready(() => {
		$('.browse').on('tap', toggleBrowseMenu)
			.hover(toggleBrowseMenu, toggleBrowseMenu);
	});
};

module.exports = {
	initialize
};

