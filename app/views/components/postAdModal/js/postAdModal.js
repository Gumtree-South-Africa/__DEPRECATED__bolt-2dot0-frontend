'use strict';
let hamburgerMenu = require('app/views/components/hamburgerMenu/js/hamburgerMenu');

let _toggleModal = (e, shouldOpen) => {
	let shouldClose = e.target === this.$closeButton[0]
		|| e.target === this.$postAdWrapper[0]
		|| e.target.parentNode === this.$closeButton[0]
		|| e.target === this.$postAdFooter[0];

	if (shouldClose || shouldOpen) {
		if (e.target === this.$hamburger[0].firstElementChild
			|| e.target.parentNode === this.$hamburger[0].firstElementChild) {
			hamburgerMenu.toggleMenu(true);
		}
		if ($(this.$welcomeModal).is(":visible")) {
			this.$welcomeModal.style.display = 'none';
		}
		this.$postAdWrapper.toggleClass('hidden');
		this.$postAdFooter.toggleClass('hidden');
		e.preventDefault();
	}
};

let initialize = () => {
	this.$postAdWrapper = $('.post-ad-wrapper');
	this.$postAdModal = $('.post-ad-modal-wrapper', this.$postAdWrapper);
	this.$closeButton = $('#js-close-post-ad-modal', this.$postAdModal);
	this.$welcomeModal = $('.welcome-wrapper .modal-wrapper')[0].firstElementChild;
	this.$hamburger = $('.js-hamburger-post');
	this.$postAdFooter = $('.modal-footer.stickybottom');
	this.$postAdButtons = $('.js-post-button');

	this.$postAdButtons.on('click', (e) => {
		_toggleModal(e, true);
	});
	this.$postAdWrapper.on('click', (e) => {
		_toggleModal(e);
	});
};

module.exports = {
	initialize
};




