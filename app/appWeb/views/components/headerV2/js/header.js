'use strict';

let $ = require('jquery');
let deepLink = require('app/appWeb/views/components/headerV2/js/deepLink.js');

let _toggleBrowseMenu = (shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = !$('#js-cat-dropdown').hasClass('hidden');
	}
    $('#js-cat-dropdown').toggleClass('hidden', shouldClose);
	$('#js-browse-dropdown #js-browse-item-text').toggleClass('menu-open', !shouldClose);
	$('#js-browse-header-item-icon').toggleClass('icon-down', shouldClose);
	$('#js-browse-header-item-icon').toggleClass('icon-up', !shouldClose);
};

let _toggleProfileMenu = (shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = !$('#js-profile-dropdown').hasClass('hidden');
	}
	$('#js-profile-dropdown').toggleClass('hidden', shouldClose);
	$('#js-profile-item-text').toggleClass('menu-open', !shouldClose);
	$('#js-profile-header-item-icon').toggleClass('icon-down', shouldClose);
	$('#js-profile-header-item-icon').toggleClass('icon-up', !shouldClose);
};

let initialize = () => {
	$(document).ready(() => {
		$('.browse').on('click', () => {
			_toggleBrowseMenu();
		}).mouseenter(() => {
			_toggleBrowseMenu(false);
		}).mouseleave(() => {
			_toggleBrowseMenu(true);
		});

		$('.profile').on('click', () => {
			_toggleProfileMenu();
		}).mouseenter(() => {
			_toggleProfileMenu(false);
		}).mouseleave(() => {
			_toggleProfileMenu(true);
		});
		deepLink.initialize();
	});
};

module.exports = {
	initialize
};

