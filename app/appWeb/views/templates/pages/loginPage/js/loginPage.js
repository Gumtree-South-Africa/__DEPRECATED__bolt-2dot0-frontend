'use strict';

let loginForm = require("app/appWeb/views/components/loginForm/js/loginForm.js");
let termsAndConditions = require("app/appWeb/views/components/termsAndConditions/js/termsAndConditions.js");

class LoginPage {
	initialize() {
		this.$loginContainer = $("#login-container");
		let queryParams = this.getAndParseQueryStrings();
		if (this.$loginContainer.hasClass("display-terms")) {
			termsAndConditions.initialize({
				termsSubmitCb: () => {
					let checkboxStatus = termsAndConditions.getCheckedStatus();
					let payload = {
						facebookToken: queryParams.facebooktoken,
						facebookId: queryParams.facebookid,
						email: queryParams.email,
						agreeTerms: checkboxStatus.hasAcceptedTerms,
						optInMarketing: checkboxStatus.marketingConsent
					};
					$.ajax({
						url: "/api/auth/loginWithFacebook",
						method: "POST",
						dataType: "json",
						contentType: "application/json",
						data: JSON.stringify(payload),
						success: () => {
							window.location.href = queryParams.redirect || '/';
						},
						error: (err) => {
							//TODO: error handling
							console.error(err);
						}
					});
				}
			});
		} else {
			loginForm.initialize({
				extraOpenDom: $("#login-container"),
				fbRedirectLink: queryParams.redirect
			});
		}
	}

	getAndParseQueryStrings() {
		let queryMap = {}, queryStrings = window.location.search;

		if (queryStrings.length > 0) {
			let queryArray = queryStrings.slice(1).split("&");
			queryArray.forEach((query) => {
				let querySplit = query.split("=");
				queryMap[querySplit[0]] = querySplit[1];
			});
		}
		return queryMap;
	}
}

module.exports = new LoginPage();
