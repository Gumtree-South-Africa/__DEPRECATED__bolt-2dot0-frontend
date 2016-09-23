'use strict';

class RegistrationForm {

	_validateFields() {
		this._toggleRegisterButton();
		return this.hasAcceptedTerms && this._validEmail();
	}

	_markValidationError(dom) {
		dom.addClass("validation-error");
		dom.change(() => {
			dom.removeClass("validation-error");
			dom.off("change");
			this._toggleRegisterButton();
		});
	}

	_register() {
		let emailAddress = this.$emailField.val();
		let passwordOne = this.$firstPassword.val();
		let passwordTwo = this.$secondPassword.val();
		let agreeTerms = this.hasAcceptedTerms;
		let optInMarketing = this.$emailConsent.is(':checked');
		let payload = {
			emailAddress: emailAddress,
			password: passwordOne,
			password2: passwordTwo,
			agreeTerms: agreeTerms,
			optInMarketing: optInMarketing
		};

		$.ajax({
			method: "POST",
			url: "/api/auth/register",
			data: payload,
			dataType: "json",
			contentType: "application/json",
			success: (res) => {
				this._handleSuccess(res);
			},
			error: (err) => {
				this._handleFailure(err);
			}
		});

	}

	_handleSuccess() {
		//TODO: handle success case
	}

	_handleFailure(err) {
		if (err.statusCode === 400) {
			//Validation errors
			let response = JSON.parse(err.responseText || '{}');
			let schemaErrors = response.schemaErrors;

			if (schemaErrors) {
				schemaErrors.forEach((error) => {
					if (error.field.indexOf("emailAddress") >= 0) {
						this._toggleEmailError();
						this._markValidationError(this.$emailField);
					} else if (error.field.indexOf("password") >= 0) {
						this._markValidationError(this.$firstPassword);
						this._markValidationError(this.$secondPassword);
					} else if (error.field.indexOf('agreeTerms') >= 0) {
						this._toggleTermsError();
					}
				});
			}

		} else if (err.statusCode === 500) {
			//TODO: handle this
		}
	}

	_validEmail() {
		let email = this.$emailField.val();
		if (!email || email.length > 64) {
			this._markValidationError(this.$emailField);
			return false;
		}
		return true;
	}

	_toggleRegisterButton() {
		let password = this.$firstPassword.val();
		let secondPassword = this.$secondPassword.val();
		let validEmail = this._validEmail();
		let shouldDisable = !password || password !== secondPassword
			|| !validEmail || !this.hasAcceptedTerms;

		this.$registerButton.prop('disabled', shouldDisable);
	}

	_checkPasswords() {
		let password = this.$firstPassword.val();
		let secondPassword = this.$secondPassword.val();
		if (password && password === secondPassword) {
			this.$firstPassword.removeClass('validation-error');
			this.$secondPassword.removeClass('validation-error');
		} else {
			this.$firstPassword.addClass('validation-error');
			this.$secondPassword.addClass('validation-error');
		}
		this._toggleRegisterButton();
	}

	// Don't let user click the submit button anyway, might not need these.
	_toggleTermsError() {
		this.$termsError.toggleClass('hidden');
		return this.$termsError.hasClass('hidden');
	}

	_toggleEmailError() {
		this.$invalidEmail.toggleClass('hidden');
		return this.$invalidEmail.hasClass('hidden');
	}

	initialize() {
		this.$form = $('#registration-form');
		this.$termsCheckbox = this.$form.find('#accept-terms');
		this.$emailConsent = this.$form.find('#email-consent');
		this.$emailField = this.$form.find('#email-input');
		this.$firstPassword = this.$form.find('#password-one');
		this.$secondPassword = this.$form.find('#password-two');
		this.$registerButton = this.$form.find('#registration-submit-button');
		this.$termsError = this.$form.find('#terms-error');
		this.$invalidEmail = this.$form.find('#invalid-email');

		this.hasAcceptedTerms = this.$termsCheckbox.is(':checked');

		this.$termsCheckbox.on('change', () => {
			this.hasAcceptedTerms = this.$termsCheckbox.is(':checked');
			this._toggleRegisterButton();
		});

		this.$firstPassword.on('change keyup', () => {
			this._checkPasswords();
		});
		this.$secondPassword.on('change keyup', () => {
			this._checkPasswords();
		});
		this.$emailField.on('change keyup', () => {
			this._validateFields();
		});

		this.$registerButton.click((e) => {
			if (this._validateFields()) {
				this._register();
			}
			e.preventDefault();
		});
	}
}

module.exports = new RegistrationForm();

