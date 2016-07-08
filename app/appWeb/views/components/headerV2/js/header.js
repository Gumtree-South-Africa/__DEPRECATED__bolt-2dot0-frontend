'use strict';

let $ = require('jquery');

let initialize = () => {
	let _toggleBrowseMenu = () => {
		$('#js-cat-dropdown').toggleClass('hidden');
		$('#js-browse-dropdown #js-item-text').toggleClass('menu-open');
		$('#js-header-item-icon').toggleClass('icon-down');
		$('#js-header-item-icon').toggleClass('icon-up');
	};

	$(document).ready(() => {
		$('.browse').on('tap', _toggleBrowseMenu)
			.hover(_toggleBrowseMenu, _toggleBrowseMenu);
	});
};

module.exports = {
	initialize
};

