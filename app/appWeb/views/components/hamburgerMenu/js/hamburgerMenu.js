'use strict';
let searchBarV2 = require('app/appWeb/views/components/searchbarV2/js/searchbarV2.js');
let Hammer = require('hammerjs');
let SimpleEventEmitter = require('public/js/common/utils/SimpleEventEmitter.js');


/**
 * A hamburger menu.
 *
 * - Events:
 *   - postButtonClicked
 *   - openStatusChanged
 *
 * - APIs:
 *   - setPostButtonEnabled
 */
class HamburgerMenuVM {
	constructor() {
		this.postButtonClicked = new SimpleEventEmitter();
		this._postButtonEnabled = true;

		this._isOpened = false;
		this.openStatusChanged = new SimpleEventEmitter();
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(domElement) {
		this._postButton = domElement.find('.js-post-button a');
		this._postButtonEnabled = !this._postButton.hasClass('disabled');
		this._postButton.on('click', (evt) => this._onPostButtonClicked(evt));
	}

	_onPostButtonClicked(evt) {
		evt.preventDefault();
		evt.stopImmediatePropagation();
		evt.stopPropagation();
		if (!this._postButtonEnabled) {
			return;
		}
		this.postButtonClicked.trigger();
	}

	/**
	 * Set enabled status of post button
	 * @param enabled
	 */
	setPostButtonEnabled(enabled) {
		enabled = !!enabled;
		if (this._postButtonEnabled === enabled) {
			return;
		}
		this._postButtonEnabled = enabled;
		if (enabled) {
			this._postButton.attr('tabindex', '0');
			this._postButton.removeClass('disabled');
		} else {
			this._postButton.attr('tabindex', '-1');
			this._postButton.addClass('disabled');
		}
	}

	setIsOpened(isOpened) {
		isOpened = !!isOpened;
		if (this._isOpened === isOpened) {
			return;
		}
		this._isOpened = isOpened;
		this.openStatusChanged.trigger(this._isOpened);
	}

}

class HamburgerMenu {
	constructor() {
		this.setupViewModel();
	}

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
				this.viewModel.setIsOpened(false);
			}
		});

		this.hamburgerMenu = $('#js-hamburger-menu')[0];
		this.hamburgerOverlay = $('#js-body-overlay')[0];
		this.overlayHammer = new Hammer(this.hamburgerOverlay);
		this.menuHammer = new Hammer(this.hamburgerMenu);
		this.overlayHammer.on('swipeleft', () => {
			if (this.open) {
				this.viewModel.setIsOpened(false);
			}
		});
		this.menuHammer.on('swipeleft', () => {
			if (this.open) {
				this.viewModel.setIsOpened(false);
			}
		});
		this.$pageContent.addClass('open-menu');
		this.$browseCategories.on('click', () => {
			this._toggleBrowseCategory();
		});
		this.$hamburgerIcon.on('click', () => {
			// The icon is clickable only when menu is closed
			this.viewModel.setIsOpened(true);
		});
		this.$hamburgerPopout.on('click', () => {
			// The popout is clickable only when menu is opened
			this.viewModel.setIsOpened(false);
		});

		this.viewModel.componentDidMount($('#js-hamburger-menu'));
		this.viewModel.setIsOpened(this.open);
		this.viewModel.openStatusChanged.addHandler((newOpenStatus) => {
			var currentOpenStatus = this.open;
			if (currentOpenStatus !== newOpenStatus) {
				this.toggleMenu();
			}
		});
	}

	// Common interface for all component to setup view model. In the future, we'll have a manager
	// to control the lifecycle of view model.
	setupViewModel() {
		this.viewModel = new HamburgerMenuVM();
	}
}

module.exports = new HamburgerMenu();
