'use strict';
let searchBarV2 = require('app/appWeb/views/components/searchbarV2/js/searchbarV2.js');

let _toggleMenu = () => {
	if (!this.open) {
		searchBarV2.closeAutoComplete();
	}
	this.$hamburgerPopout[0].style.right = (this.open) ? '100%' : 0;
	this.$hamburgerContents.animate({
		left: (this.open) ? '-70%' : '0',
		right: (this.open) ? '100%' : '30%'
	});
	this.$body.toggleClass('overflow-hidden');
	this.$modalFooter.toggleClass('hidden');
	this.$pageContent.animate({
		marginLeft: (this.open) ? 0 : '70%'
	});
	this.$header.animate({
		left: (this.open) ? 0 : '70%'
	});
	this.$pageContent.toggleClass('menu-closed');
	this.$hamburgerContents.toggleClass('hamburger-open hamburger-closed');
	this.open = !this.open;
};

let _toggleBrowseCategory = () => {
	this.$browseArrow.toggleClass('icon-chevron');
	this.$browseArrow.toggleClass('icon-up');
	$('li', this.$browse).toggleClass('hidden');
};

let _isBreakpotint = (alias) => {
	return $(`#js-is-${alias}`, this.$hamburgerContents).is(":visible");
};

let _currentBreakpoint = () => {
	if (_isBreakpotint('mobile')) {
		return 'mobile';
	} else if (_isBreakpotint('desktop')) {
		return 'desktop';
	}
};

let initialize = () => {
	this.$body = $('body');
	this.open = false;
	this.$browse = $('#js-hamburger-browse');
	this.$browseArrow = $('#js-browse-arrow', this.$browse);
	this.$browseCategories = $('#js-browse-categories', this.$browse);
	this.$modalFooter = $('.modal-footer');
	this.$header = $('.headerV2');
	this.$pageContent = $('.containment');
	this.$hamburgerPopout = $('#js-body-overlay');
	this.$hamburgerIcon = $('#js-hamburger-icon');
	this.$hamburgerContents = $('.hamburger-contents');
	this.currentWindowSize = _currentBreakpoint();
	
	this.$body.trigger('viewportChanged', this.currentWindowSize);
	$(window).bind('resize', () => {
		let newWindowSize = _currentBreakpoint();
		if (newWindowSize !== this.currentWindowSize) {
			this.$body.trigger('viewportChanged', [newWindowSize, this.currentWindowSize]);
			this.currentWindowSize = newWindowSize;
		}
	});
	
	this.$body.on('viewportChanged', (event, newSize, oldSize) => {
		if (newSize === 'desktop' && oldSize === 'mobile' && this.open) {
			_toggleMenu();
		}
	});

	this.$pageContent.addClass('open-menu');
	this.$browseCategories.on('click', _toggleBrowseCategory);
	this.$hamburgerIcon.on('click', _toggleMenu);
	this.$hamburgerPopout.on('click', _toggleMenu);
};

module.exports = {
	initialize
};




