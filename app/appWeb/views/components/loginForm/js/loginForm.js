'use strict';

class LoginForm {
	_handleLoginSuccess(data) {
		// if exists and is a function
		if (this.submitCb && !!(this.submitCb && this.submitCb.constructor && this.submitCb.call && this.submitCb.apply)) {
			this.submitCb(data);
		} else {
			// default redirect to homepage
			window.location.href = this.redirectUrl;
		}
	}

	_handleLoginFailure(err) {
		// validation error
		if (err.status === 400) {
			let responseText = JSON.parse(err.responseText || '{}');

			if (responseText.hasOwnProperty("schemaErrors")) {
				responseText.schemaErrors.forEach((error) => {
					if (error.field.indexOf("emailAddress") >= 0) {
						this._markValidationError(this.$emailInput);
					} else if (error.field.indexOf("password") >= 0) {
						this._markValidationError(this.$passwordInput.add(this.$showPassInput));
					}
				});
			}
		} else if (err.status === 401) {
			// server authentication error (bad user/pass)
			let $inputs = this.$emailInput.add(this.$passwordInput);
			this._markValidationError($inputs);
		}
	}

	_markValidationError(dom) {
		dom.addClass("validation-error");
		dom.change(() => {
			dom.removeClass("validation-error");
			dom.off("change");
		});
	}

	_login(emailAddress, password) {
		let hasErrors = false;
		if (!emailAddress || emailAddress.length > 64) {
			this._markValidationError(this.$emailInput);
			hasErrors = true;
		}

		if (!password || password.length < 6 || password.length > 25) {
			this._markValidationError(this.$passwordInput.add(this.$showPassInput));
			hasErrors = true;
		}

		if (!hasErrors) {
			let payload = {
				emailAddress,
				password
			};

			if (this.extraPayload) {
				payload[this.extraPayload.key] = this.extraPayload.payload;
			}

			$.ajax({
				method: "POST",
				url: "/api/auth/login",
				data: JSON.stringify(payload),
				dataType: "json",
				contentType: "application/json",
				success: (res) => {
					this._handleLoginSuccess(res);
				},
				error: (err) => {
					this._handleLoginFailure(err);
				}
			});
		}
	}

	_toggleShowHidePassword() {
		if (this.$passwordInput.hasClass("hidden")) {
			this.$passwordInput.val(this.$showPassInput.val());
			this.$passwordInput.removeClass("hidden");
			this.$showPassInput.addClass("hidden");
		} else {
			this.$showPassInput.val(this.$passwordInput.val());
			this.$passwordInput.addClass("hidden");
			this.$showPassInput.removeClass("hidden");
		}
	}

	setFbRedirectUrl(url) {
		this.fbRedirectLink = url;
	}

	setSubmitCb(cb) {
		this.submitCb = cb;
	}

	initialize(options) {
		options = options || {};
		this.$extraOpenDom = options.extraOpenDom;
		this.$form = $("#login-form");
		this.$fbButton = $(".facebook-button");
		this.$signInSection = this.$form.find(".sign-in-section");
		this.$emailInput = this.$form.find('input[type="email"]');
		this.$passwordInput = this.$form.find('input[type="password"]');
		this.$showPassInput = this.$form.find('input[type="text"]');
		this.$submitButton = this.$form.find('.submit-btn');
		this.redirectUrl = this.$form.find('#redirect-url').text() || '/';
		this.fbRedirectLink = options.fbRedirectLink || "/";

		// already open on initialize
		if (!this.$signInSection.hasClass("open")) {
			this.$emailInput.focus(() => {
				this.$signInSection.addClass("open");
				if (this.$extraOpenDom) {
					this.$extraOpenDom.addClass("open");
				}
			});
		}

		this.$fbButton.on("click", () => {
			// let baseFacebookPath = "";
			let path = `/login/facebook?redirect=${this.fbRedirectLink}`;
			window.location.href = path;
		});

		this.$submitButton.click((evt) => {
			let emailVal = this.$emailInput.val();
			let passVal = this.$passwordInput.val();

			this._login(emailVal, passVal);

			evt.preventDefault();
		});

		this.$form.find(".show-hide-password").click((evt) => {
			this._toggleShowHidePassword();
			evt.stopPropagation();
			evt.preventDefault();
		});
	}
}

module.exports = new LoginForm();
