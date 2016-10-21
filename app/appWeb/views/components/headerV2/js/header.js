'use strict';

let CookieUtils = require("public/js/common/utils/CookieUtils.js");

let deepLink = require('app/appWeb/views/components/headerV2/js/deepLink.js');
let hamburgerMenu = require("app/appWeb/views/components/hamburgerMenu/js/hamburgerMenu.js");
require("app/appWeb/views/components/profileMenu/js/profileMenu.js").initialize();

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

let _logoutUnsubscribePushNotification = () => {
	let subscriptionFromCookieStr = CookieUtils.getCookie('GCMSubscription');
	if (subscriptionFromCookieStr === '') {
		return;
	}

	let subscriptionFromCookie = JSON.parse(subscriptionFromCookieStr);
	let payload = {
		subscription: subscriptionFromCookie,
		endpoint: subscriptionFromCookie.endpoint
	};
	$.ajax({
		url: '/api/push/subscription',
		type: 'DELETE',
		data: JSON.stringify(payload),
		dataType: 'json',
		contentType: "application/json",
		success: function(output) {
			console.log('Success in unsubscribing to push notification in server');
			console.log(output);

			// delete subscription cookie
			CookieUtils.setCookie('GCMSubscription', '', -1);
		},
		error: function(err) {
			console.log('Failed to unsubscribe to push notification in server');
			console.log(err);
		}
	});
};

// onReady separated out for easy testing
let onReady = () => {
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

	this.$headerlogout = this.$header.find('#header-logout');
	this.$headerlogout.on('click', ()  => {
		_logoutUnsubscribePushNotification();
	});
};

module.exports = {
	onReady,
	initialize
};
