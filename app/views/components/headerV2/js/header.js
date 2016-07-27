'use strict';

let $ = require('jquery');
let deepLink = require('app/views/components/headerV2/js/deepLink.js');

let _toggleBrowseMenu = (shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = !this.$catDrop.hasClass('hidden');
	}
    this.$catDrop.toggleClass('hidden', shouldClose);
	$('#js-browse-dropdown #js-browse-item-text').toggleClass('menu-open', !shouldClose);
	this.$browseHeaderIcon.toggleClass('icon-down', shouldClose);
	this.$browseHeaderIcon.toggleClass('icon-up', !shouldClose);
};

let _toggleProfileMenu = (shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = !this.$profileDrop.hasClass('hidden');
	}
	this.$profileDrop.toggleClass('hidden', shouldClose);
	$('#js-profile-item-text').toggleClass('menu-open', !shouldClose);
	this.$profileHeaderIcon.toggleClass('icon-down', shouldClose);
	this.$profileHeaderIcon.toggleClass('icon-up', !shouldClose);
};

// onReady separated out for easy testing
let onReady = () => {
	console.log('onReady');
	this.$header.find('.browse').on('click', () => {
		_toggleBrowseMenu();
	}).mouseenter(() => {
		_toggleBrowseMenu(false);
	}).mouseleave(() => {
		_toggleBrowseMenu(true);
	});

	this.$header.find('.profile').on('click', () => {
		_toggleProfileMenu();
	}).mouseenter(() => {
		_toggleProfileMenu(false);
	}).mouseleave(() => {
		_toggleProfileMenu(true);
	});
	deepLink.initialize();
};

// Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
let initialize = (registerOnReady = true) => {

	this.$header = $(".headerV2");
	this.$profileDrop = this.$header.find('#js-profile-dropdown');
	this.$profileHeaderIcon = this.$header.find("#js-profile-header-item-icon");

	this.$catDrop = this.$header.find('#js-cat-dropdown');
	this.$browseHeaderIcon = this.$header.find("#js-browse-header-item-icon");

	if (registerOnReady) {
		$(document).ready(onReady);
	}
};

module.exports = {
	onReady,
	initialize
};

