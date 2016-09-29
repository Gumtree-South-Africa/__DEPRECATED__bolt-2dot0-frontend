'use strict';

let loginForm = require("app/appWeb/views/components/loginForm/js/loginForm.js");

class LoginModal {
	openModal(options) {
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

		// this.$facebookButton.on('click', _checkConsent);
		loginForm.initialize({
			extraOpenDom: this.$loginModal
		});
	}
}

module.exports = new LoginModal();
