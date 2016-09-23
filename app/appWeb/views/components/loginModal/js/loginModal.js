'use strict';

let loginForm = require("app/appWeb/views/components/loginForm/js/loginForm.js");

class LoginModal {
	openModal(options) {
		this.$loginModal.removeClass("hidden");
		this.$mask.removeClass("hidden");
		loginForm.setSubmitCb(options.submitCb);
	}

	closeModal() {
		this.$loginModal.addClass("hidden");
		this.$mask.addClass("hidden");
	}

	_checkConsent(e) {
		if (!this.hasConsented) {
			this.$consentError.removeClass('invisible');
			e.preventDefault();
		}
	}

	initialize() {
		this.$loginModal = $('#login-modal');
		this.$mask = $("#login-modal-mask");
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

		// this.$facebookButton.on('click', _checkConsent);
		loginForm.initialize({
			extraOpenDom: this.$loginModal
		});
	}
}

module.exports = new LoginModal();
