'use strict';

let _toggleModal = (e, shouldClose) => {
	if (shouldClose === undefined) {
		shouldClose = e.target === this.$closeButton[0]
			|| e.target === this.$postAdWrapper[0]
			|| e.target.parentNode === this.$closeButton[0];
	}

	if (shouldClose) {
		this.$postAdWrapper.toggleClass('hidden');
	}
};

let initialize = () => {
	this.$postAdWrapper = $('.post-ad-wrapper');
	this.$postAdModal = $('.post-ad-modal-wrapper', this.$postAdWrapper);
	this.$closeButton = $('#js-close-post-ad-modal', this.$postAdModal);
	this.$postAdFooter = this.$postAdWrapper.find('.post-ad-footer');
	this.$singleFileInput = $('#fileUpload');
	this.$postAdFooter.on('click', (e) => {
		_toggleModal(e, true);
		this.$singleFileInput.click();
	});

	this.$postAdWrapper.on('click', (e) => {
		_toggleModal(e);
	});
};

module.exports = {
	initialize
};




