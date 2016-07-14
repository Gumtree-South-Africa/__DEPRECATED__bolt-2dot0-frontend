'use strict';

let _toggleMenu = () => {
	this.$hamburgerPopout[0].style.right = (this.open) ? '100%' : 0;
	this.$hamburgerContents.animate({
		left: (this.open) ? '-70%' : '0',
		right: (this.open) ? '100%' : '30%'
	});
	this.$body.toggleClass('overflow-hidden');
	this.$modalFooter.toggleClass('hidden');
	this.$pageContent.animate({
		left: (this.open) ? 0 : '70%'
	});
	this.$pageContent.toggleClass('menu-closed');
	this.$hamburgerContents.toggleClass('hamburger-open hamburger-closed');
	this.open = !this.open;
};

let _toggleBrowseCategory = () => {
	$('li', this.$browse).toggleClass('hidden');
};

let initialize = () => {
	this.$body = $('body');
	this.open = false;
	this.$browse = $('#js-hamburger-browse');
	this.$browseCategories = $('#js-browse-categories', this.$browse);
	this.$modalFooter = $('.modal-footer');
	this.$pageContent = $('.headerV2, .containment');
	this.$hamburgerPopout = $('#js-body-overlay');
	this.$hamburgerIcon = $('#js-hamburger-icon');
	this.$hamburgerContents = $('.hamburger-contents');

	this.$pageContent.addClass('open-menu');
	this.$browseCategories.on('click', _toggleBrowseCategory);
	this.$hamburgerIcon.on('click', _toggleMenu);
	this.$hamburgerPopout.on('click', _toggleMenu);
};

module.exports = {
	initialize
};




