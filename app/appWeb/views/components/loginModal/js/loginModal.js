'use strict';

let loginForm = require("app/appWeb/views/components/loginForm/js/loginForm.js");

// TODO Old Login Modal - till login is enabled on 2.0
let _checkConsent = (e) => {
	if (!$('#login-modal').find('#consent-checkbox').is(':checked')) {
		$('#login-modal').find('#consent-error').removeClass('invisible');
		e.stopPropagation();
		e.preventDefault();
	}
};
// End Old Login Modal - till login is enabled on 2.0

class LoginModal {
	openModal(options) {
		// TODO Old Login Modal - till login is enabled on 2.0
		this.$loginModal.find('.email-login-btn a').attr('href', options.links.emailLogin);
		this.$loginModal.find('.register-link').attr('href', options.links.register);
		this.$loginModal.find('.facebook-button a').attr('href', options.links.facebookLogin);
		// End Old Login Modal - till login is enabled on 2.0

		this.$loginModal.removeClass("hidden");
		this.$mask.removeClass("hidden");
		loginForm.setSubmitCb(options.submitCb);
		loginForm.setFbRedirectUrl(options.fbRedirectUrl);
	}

	closeModal() {
		this.$loginModal.addClass("hidden");
		this.$mask.addClass("hidden");
	}

	initialize() {
		this.$loginModal = $('#login-modal');
		this.$mask = $("#login-modal-mask");

		// TODO Old Login Modal - till login is enabled on 2.0
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
		// End Old Login Modal - till login is enabled on 2.0

		loginForm.initialize({
			extraOpenDom: this.$loginModal
		});
	}
}

module.exports = new LoginModal();
