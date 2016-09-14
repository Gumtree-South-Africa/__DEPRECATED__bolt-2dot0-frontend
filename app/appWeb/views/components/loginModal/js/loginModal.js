'use strict';

let _checkConsent = (e) => {
	if (!this.hasConsented) {
		this.$consentError.removeClass('hidden');
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
		if (this.hasConsented && !this.$consentError.hasClass('hidden')) {
			this.$consentError.addClass('hidden');
		}
	});

	this.$facebookButton.on('click', _checkConsent);
};

module.exports = {
	initialize
};
