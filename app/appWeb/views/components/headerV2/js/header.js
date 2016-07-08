'use strict';

let $ = require('jquery');

let initialize = () => {
	let _toggleBrowseMenu = () => {
		$('#js-cat-dropdown').toggleClass('hidden');
		$('#js-browse-dropdown #js-browse-item-text').toggleClass('menu-open');
		$('#js-browse-header-item-icon').toggleClass('icon-down');
		$('#js-browse-header-item-icon').toggleClass('icon-up');
	};

	let _toggleProfileMenu = () => {
		$('#js-profile-dropdown').toggleClass('hidden');
		$('#js-profile-item-text').toggleClass('menu-open');
		$('#js-profile-header-item-icon').toggleClass('icon-down');
		$('#js-profile-header-item-icon').toggleClass('icon-up');
	};

	$(document).ready(() => {
		$('.browse').on('tap', _toggleBrowseMenu)
			.hover(_toggleBrowseMenu, _toggleBrowseMenu);

		$('.profile').on('tap', _toggleProfileMenu)
			.hover(_toggleProfileMenu, _toggleProfileMenu);
	});
};

module.exports = {
	initialize
};

