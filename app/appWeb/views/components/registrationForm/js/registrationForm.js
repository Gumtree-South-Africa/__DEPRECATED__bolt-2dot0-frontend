'use strict';

let termsAndConditions = require("app/appWeb/views/components/termsAndConditions/js/termsAndConditions.js");

class RegistrationForm {

	_validateFields() {
		this._toggleRegisterButton();
		return termsAndConditions.getCheckedStatus().hasAcceptedTerms && this._validEmail();
	}

	_markValidationError(dom) {
		dom.addClass("validation-error");
		dom.change(() => {
			if (dom === this.$emailField) {
				this.$invalidEmail.addClass('hidden');
			} else if (dom === this.$termsCheckbox) {
				this.$termsError.addClass('hidden');
			}
			dom.removeClass("validation-error");
			dom.off("change");
			this._toggleRegisterButton();
		});
	}

	_register() {
		let emailAddress = this.$emailField.val();
		let passwordOne = this.$firstPassword.val();
		let passwordTwo = this.$secondPassword.val();
		let checkboxStatus = termsAndConditions.getCheckedStatus();
		let payload = {
			emailAddress: emailAddress,
			password: passwordOne,
			password2: passwordTwo,
			agreeTerms: checkboxStatus.hasAcceptedTerms,
			optInMarketing: checkboxStatus.marketingConsent,
			redirectUrl: this.redirectUrl || '/'
		};
		this.$registerButton.prop('disabled', true);

		$.ajax({
			method: "POST",
			url: "/api/auth/register",
			data: JSON.stringify(payload),
			dataType: "json",
			contentType: "application/json",
			success: (res) => {
				this.$registerButton.prop('disabled', false);
				this._handleSuccess(res);
			},
			error: (err) => {
				this._toggleRegisterButton();
				this._handleFailure(err);
			}
		});
	}

	_handleSuccess() {
		this.$form.addClass('hidden');
		this.$registrationSuccess.removeClass('hidden');
	}

	_handleFailure(err) {
		if (err.status === 400) {
			//Validation errors
			let response = JSON.parse(err.responseText || '{}');
			let schemaErrors = response.schemaErrors;

			if (schemaErrors) {
				schemaErrors.forEach((error) => {
					if (error.field.indexOf("emailAddress") >= 0) {
						this._markValidationError(this.$emailField);
						this._toggleEmailError();
					} else if (error.field.indexOf("password") >= 0) {
						this._markValidationError(this.$firstPassword);
						this._markValidationError(this.$secondPassword);
					}
				});
			}

		} else if (err.status === 500) {
			this.$failure.removeClass('hidden');
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
			|| !validEmail || !termsAndConditions.getCheckedStatus().hasAcceptedTerms;

		this.$registerButton.prop('disabled', shouldDisable);
	}

	_checkPasswords() {
		let password = this.$firstPassword.val();
		let secondPassword = this.$secondPassword.val();
		if (password && password === secondPassword && password.length >= 6 && password.length <= 25) {
			this.$firstPassword.removeClass('validation-error');
			this.$secondPassword.removeClass('validation-error');
		} else {
			this.$firstPassword.addClass('validation-error');
			this.$secondPassword.addClass('validation-error');
		}
		this._toggleRegisterButton();
	}

	_toggleEmailError() {
		this.$invalidEmail.toggleClass('hidden', !this.$emailField.hasClass('validation-error'));
		return this.$invalidEmail.hasClass('hidden');
	}

	initialize() {
		this.$registrationForm = $('#registration-form');
		this.$form = this.$registrationForm.find('form');
		this.$emailField = this.$registrationForm.find('#email-input');
		this.$firstPassword = this.$registrationForm.find('#password-one');
		this.$secondPassword = this.$registrationForm.find('#password-two');
		this.$registerButton = this.$registrationForm.find('#registration-submit-button');
		this.$termsError = this.$registrationForm.find('#terms-error');
		this.$invalidEmail = this.$registrationForm.find('#invalid-email');
		this.$failure = this.$registrationForm.find('#general-error');
		this.$registrationSuccess = this.$registrationForm.siblings('#registration-success');
		this.redirectUrl = this.$registrationForm.find('#redirect-url').val();

		termsAndConditions.initialize({
			termsChangeCb: () => {
				this._toggleRegisterButton();
			}
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

