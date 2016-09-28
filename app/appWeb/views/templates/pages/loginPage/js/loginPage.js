'use strict';

let loginForm = require("app/appWeb/views/components/loginForm/js/loginForm.js");
let termsAndConditions = require("app/appWeb/views/components/termsAndConditions/js/termsAndConditions.js");

class LoginPage {
	initialize() {
		this.$loginContainer = $("#login-container");
		if (this.$loginContainer.hasClass("display-terms")) {
			termsAndConditions.initialize({
				termsSubmitCb: () => {
					let checkboxStatus = termsAndConditions.getCheckedStatus();
					let payload = {
						fbCode: termsAndConditions.getFbCode(),
						agreeTerms: checkboxStatus.hasAcceptedTerms,
						optInMarketing: checkboxStatus.marketingConsent,
						redirectUrl: this.$loginContainer.data("deferred-link")
					};
					$.ajax({
						url: "/api/auth/loginWithFacebook",
						method: "POST",
						dataType: "json",
						contentType: "application/json",
						data: JSON.stringify(payload)
					});
				}
			});
		} else {
			loginForm.initialize({
				extraOpenDom: $("#login-container")
			});
		}
	}
}

module.exports = new LoginPage();
