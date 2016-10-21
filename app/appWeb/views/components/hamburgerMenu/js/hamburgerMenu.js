'use strict';
let searchBarV2 = require('app/appWeb/views/components/searchbarV2/js/searchbarV2.js');
let Hammer = require('hammerjs');


class HamburgerMenu {
	toggleMenu(shouldClose) {
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
		this.$searchbar.animate({
			left: (this.open) ? 0 : '70%'
		});
		this.$pageContent.toggleClass('menu-closed');
		this.$hamburgerContents.toggleClass('hamburger-open hamburger-closed');
		this.open = !this.open;
	}

	_toggleBrowseCategory() {
		this.$browseArrow.toggleClass('icon-chevron-blue');
		this.$browseArrow.toggleClass('icon-up-blue');
		$('li', this.$browse).toggleClass('hidden');
	}

	_isBreakpotint(alias) {
		return $(`#js-is-${alias}`, this.$hamburgerContents).is(":visible");
	}

	_currentBreakpoint() {
		if (this._isBreakpotint('mobile')) {
			return 'mobile';
		} else if (this._isBreakpotint('desktop')) {
			return 'desktop';
		}
	}

	initialize() {
		this.$html = $('html');
		this.$body = $('body');
		this.open = false;
		this.$browse = $('#js-hamburger-browse');
		this.$browseArrow = $('#js-browse-arrow', this.$browse);
		this.$browseCategories = $('#js-browse-categories', this.$browse);
		this.$modalFooter = $('.modal-footer');
		this.$header = $('.headerV2');
		this.$searchbar = $("#search-bar");
		this.$pageContent = $('.containment');
		this.$hamburgerPopout = $('#js-body-overlay');
		this.$hamburgerIcon = $('#js-hamburger-icon');
		this.$hamburgerContents = $('.hamburger-contents');
		this.currentWindowSize = this._currentBreakpoint();

		this.$body.trigger('viewportChanged', this.currentWindowSize);
		$(window).bind('resize', () => {
			let newWindowSize = this._currentBreakpoint();
			if (newWindowSize !== this.currentWindowSize) {
				this.$body.trigger('viewportChanged', [newWindowSize, this.currentWindowSize]);
				this.currentWindowSize = newWindowSize;
			}
		});

		this.$body.on('viewportChanged', (event, newSize, oldSize) => {
			if (newSize === 'desktop' && oldSize === 'mobile' && this.open) {
				this.toggleMenu();
			}
		});

		this.hamburgerMenu = $('#js-hamburger-menu')[0];
		this.hamburgerOverlay = $('#js-body-overlay')[0];
		this.overlayHammer = new Hammer(this.hamburgerOverlay);
		this.menuHammer = new Hammer(this.hamburgerMenu);
		this.overlayHammer.on('swipeleft', () => {
			if (this.open) {
				this.toggleMenu();
			}
		});
		this.menuHammer.on('swipeleft', () => {
			if (this.open) {
				this.toggleMenu();
			}
		});
		this.$pageContent.addClass('open-menu');
		this.$browseCategories.on('click', () => {
			this._toggleBrowseCategory();
		});
		this.$hamburgerIcon.on('click', () => {
			this.toggleMenu();
		});
		this.$hamburgerPopout.on('click', () => {
			this.toggleMenu();
		});
	}
}

module.exports = new HamburgerMenu();
