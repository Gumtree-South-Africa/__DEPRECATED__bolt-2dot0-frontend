'use strict';

let deepLink = require('app/appWeb/views/components/headerV2/js/deepLink.js');
let hamburgerMenu = require("app/appWeb/views/components/hamburgerMenu/js/hamburgerMenu.js");
require("app/appWeb/views/components/profileMenu/js/profileMenu.js").initialize();

window._menuL2leaveOpen = false;

let _toggleBrowseMenu = (shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = !this.$catDrop.hasClass('hidden');
	}
    this.$catDrop.toggleClass('hidden', shouldClose);
	$('#js-browse-dropdown #js-browse-item-text').toggleClass('menu-open', !shouldClose);
	this.$browseHeaderIcon.toggleClass('icon-down', shouldClose);
	this.$browseHeaderIcon.toggleClass('icon-up', !shouldClose);
};

let showL1HideL2 = () => {

	//$('#js-cat-dropdown').show();
	$('.parent-l1').show();
	$('.child-l2').addClass('hidden');
	 window._menuL2leaveOpen = false;
	 console.log('hghghghghg ' + window._menuL2leaveOpen);
};

let hideL1ShowL2 = (except) => {
   $('.parent-l1').hide();
   except.hide();
   window._menuL2leaveOpen = true;
   let children = '#' + except.attr('data-submenu');
   $(children).removeClass('hidden');

   let categoryTitle = $(except[0].innerHTML + ' span').text();
   if ($('.subCatMenuHeader .subcat-title:eq(1)').length !== 0) {
	   $(children + ' .subCatMenuHeader .subcat-title:eq(1)').text(categoryTitle);
   }
};

let setupMenu = () => {
	if ($('div#button-back').length !== 0) {
		showL1HideL2();
	}
	$('.child-l2').addClass('hidden');
	$('.parent-l1').click(function(e) {
		e.preventDefault();
	    hideL1ShowL2($(this));
	   });

   $('#js-cat-dropdown').on('click', '.back-button', showL1HideL2).on('click', '.link-item.l2', function() {
	 _toggleBrowseMenu();
	//  console.info('Ocultado');
 });
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
	this.$header.find('.browse').on('click', () => {
		//_toggleBrowseMenu();
	}).mouseenter(() => {
		_toggleBrowseMenu(false);
		if ($('#js-cat-dropdown').mouseenter) {
			console.log('mouseenter = true');
		}

	}).mouseleave(() => {
		if (!window._menuL2leaveOpen) {
			_toggleBrowseMenu(true);
		}

		if ($('#js-cat-dropdown').mouseleave) {
			console.log('mouseleave = true');
		}
	});
	this.$header.find('.menu-item.parent-l1').on('click', () => {
		_toggleBrowseMenu(false);
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

/**
 * Header
 *
 * - Properties:
 *   - hamburgerMenu
 */
class Header {
	constructor() {
	}

	/**
	 * Lifecycle callback which will be called when component has been loaded
	 * @param domElement The jquery object for the root element of this component
	 */
	componentDidMount(/*domElement*/) {
		// As hamburger menu is still a singleton, will initialize field here
		this.hamburgerMenu = hamburgerMenu.viewModel;
	}
}

// Note about registerOnReady - for tests only, call: .initialize(false) then invoke .onReady()
let initialize = (registerOnReady = true) => {
	setupMenu();
	this.ishamburgerMenu = typeof($('#js-hamburger-menu')[0]) !== "undefined";

	if (this.ishamburgerMenu) {
		hamburgerMenu.initialize();
	}

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
	initialize,
	Header
};
