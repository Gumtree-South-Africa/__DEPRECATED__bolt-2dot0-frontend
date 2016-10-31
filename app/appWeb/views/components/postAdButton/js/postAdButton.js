'use strict';

let _toggleModal = (e, shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = e.target === this.$closeButton[0]
			|| e.target === this.$postAdWrapper[0]
			|| e.target.parentNode === this.$closeButton[0];
	}

	if (shouldClose) {
		window.BOLT.trackEvents({
			"event": "PostAdForm", "p": {"t": "PostAdForm"}
		});
		window.BOLT.trackEvents({
			"event": "PostAdOptionModalClosed"
		});
		this.$postAdWrapper.toggleClass('hidden');
	}
};

let initialize = () => {
	this.$postAdWrapper = $('.mobile-post-ad-wrapper');
	this.$postAdModal = $('.mobile-post-ad-modal-wrapper', this.$postAdWrapper);
	this.$closeButton = $('#js-moblie-close-post-ad-modal', this.$postAdModal);
	this.$mobileFooter = $(".modal-footer-mobile");
	this.$desktopFooter = $(".modal-footer-desktop");
	this.$mobileFileInput = $('#mobileFileUpload');
	this.$deskptopFileInput = $('#desktopFileUpload');
	this.$mobileFooter.on('click', (e) => {
		window.BOLT.trackEvents({"event": "PostAdPhotoUpload", "p": {"t": "PostAdPhotoUpload"} });
		_toggleModal(e, true);
		this.$mobileFileInput.click();
	});

	this.$desktopFooter.on('click', (e) => {
		_toggleModal(e, true);
		this.$deskptopFileInput.click();
		window.BOLT.trackEvents({"event": "PostAdPhotoBegin"});
	});

	this.$postAdWrapper.on('click', (e) => {
		_toggleModal(e);
	});
};

module.exports = {
	initialize
};




