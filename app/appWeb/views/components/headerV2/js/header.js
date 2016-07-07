'use strict';

let $ = require('jquery');

let initialize = () => {

	function toggleProfileMenu() {
		$('.js-profile-menu').toggleClass('hidden');
	}
	
	function toggleBrowseMenu() {
		$('.js-cat-dropdown').toggleClass('hidden');
		$('.item-text').toggleClass('menu-open');
	}

	$(document).ready(() => {
		$('.profile').on('tap',toggleProfileMenu)
			.hover(toggleProfileMenu, toggleProfileMenu);
		
		$('.browse').on('tap', toggleBrowseMenu)
			.hover(toggleBrowseMenu, toggleBrowseMenu);
	});
};

module.exports = {
	initialize
};

