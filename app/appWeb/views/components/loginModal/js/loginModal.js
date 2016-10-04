'use strict';

let _checkConsent = (e) => {
	if (!this.hasConsented) {
		this.$consentError.removeClass('invisible');
		e.preventDefault();
	}
};

let initialize = () => {
	this.$loginModal = $('.login-modal');
	this.$facebookButton = this.$loginModal.find('#facebook-link');
	this.$consentCheck = this.$loginModal.find('#consent-checkbox');
	this.$consentError = this.$loginModal.find('#consent-error');
	this.hasConsented = this.$consentCheck.is(':checked');
	this.$consentCheck.on('change', () => {
		this.hasConsented = this.$consentCheck.is(':checked');
		if (this.hasConsented && !this.$consentError.hasClass('invisible')) {
			this.$consentError.addClass('invisible');
		}
	});

	this.$facebookButton.on('click', _checkConsent);
};

module.exports = {
	initialize
};
