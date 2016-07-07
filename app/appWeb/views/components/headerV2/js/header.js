'use strict';

let $ = require('jquery');

let initialize = () => {

	function toggleProfileMenu() {
		$('.profile-menu').toggleClass('hidden');
	}
	
	function toggleBrowseMenu() {
		$('.cat-dropdown').toggleClass('hidden');
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

