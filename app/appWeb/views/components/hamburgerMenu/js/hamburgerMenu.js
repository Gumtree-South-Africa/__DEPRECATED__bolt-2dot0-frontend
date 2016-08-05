'use strict';
let searchBarV2 = require('app/appWeb/views/components/searchbarV2/js/searchbarV2.js');
let Hammer = require('hammerjs');

let toggleMenu = () => {
	if (this.open === undefined) {
		this.open = shouldClose;
	}

	if (!this.open && searchBarV2.isOnPage()) {
		searchBarV2.closeAutoComplete(true, true);
	}
	this.$hamburgerPopout[0].style.right = (this.open) ? '100%' : 0;
	this.$hamburgerContents.animate({
		left: (this.open) ? '-70%' : '0',
		right: (this.open) ? '100%' : '30%'
	}, () => {
		this.$hamburgerContents.find(".js-hamburger-post .btn").focus();
	});
	this.$html.toggleClass('overflow-hidden');
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
	this.$html = $('html');
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
			toggleMenu();
		}
	});

	this.hamburgerMenu = document.getElementById('js-hamburger-menu');
	this.hamburgerOverlay = document.getElementById('js-body-overlay');
	this.overlayHammer = new Hammer(this.hamburgerOverlay);
	this.menuHammer = new Hammer(this.hamburgerMenu);
	this.overlayHammer.on('swipeleft', () => {
		if (this.open) {
			toggleMenu();
		}
	});
	this.menuHammer.on('swipeleft', () => {
		if (this.open) {
			toggleMenu();
		}
	});
	this.$pageContent.addClass('open-menu');
	this.$browseCategories.on('click', _toggleBrowseCategory);
	this.$hamburgerIcon.on('click', toggleMenu);
	this.$hamburgerPopout.on('click', toggleMenu);
};

module.exports = {
	initialize,
	toggleMenu
};




