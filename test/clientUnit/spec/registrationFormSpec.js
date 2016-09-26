"use strict";

let registrationFormController = require("app/appWeb/views/components/registrationForm/js/registrationForm.js");
let specHelper = require('../helpers/commonSpecHelper.js');


describe("Registration Form", () => {

	describe("Field Validation", () => {
		it("should check password", () => {
			let $testArea = specHelper.setupTest("registrationForm_es_MX", {}, "es_MX");
			registrationFormController.initialize();
			let $passwordOne = $testArea.find("#password-one");
			let $passwordTwo = $testArea.find("#password-two");
			let $button = $testArea.find("#registration-submit-button");

			//check password permutations
			expect($passwordOne.hasClass('validation-error')).toBeFalsy();
			expect($passwordTwo.hasClass('validation-error')).toBeFalsy();
			specHelper.simulateTextInput($passwordOne, 'asdfas');
			specHelper.simulateTextInput($passwordTwo, 'a');
			expect($passwordOne.hasClass('validation-error')).toBeTruthy();
			expect($passwordTwo.hasClass('validation-error')).toBeTruthy();
			specHelper.simulateTextInput($passwordTwo, 'asdfas');
			expect($passwordOne.hasClass('validation-error')).toBeFalsy();
			expect($passwordTwo.hasClass('validation-error')).toBeFalsy();
			specHelper.simulateTextInput($passwordOne, 'asdfas');
			specHelper.simulateTextInput($passwordTwo, 'a');
			expect($passwordOne.hasClass('validation-error')).toBeTruthy();
			expect($passwordTwo.hasClass('validation-error')).toBeTruthy();
			specHelper.simulateTextInput($passwordTwo, 'asdfas');
			expect($passwordOne.hasClass('validation-error')).toBeFalsy();
			expect($passwordTwo.hasClass('validation-error')).toBeFalsy();
			specHelper.simulateTextInput($passwordOne, 'a');
			specHelper.simulateTextInput($passwordTwo, 'a');
			expect($passwordOne.hasClass('validation-error')).toBeTruthy();
			expect($button.is(':disabled')).toBeTruthy();
		});

		it('should validate email length', () => {
			let $testArea = specHelper.setupTest("registrationForm_es_MX", {}, "es_MX");
			registrationFormController.initialize();
			let $emailField = $testArea.find('#email-input');
			let $button = $testArea.find("#registration-submit-button");
			let $passwordOne = $testArea.find("#password-one");
			let $passwordTwo = $testArea.find("#password-two");
			specHelper.simulateTextInput($passwordOne, 'asdf');
			specHelper.simulateTextInput($passwordTwo, 'asdf');

			specHelper.simulateTextInput($emailField, 'adsf');
			expect($emailField.hasClass('validation-error')).toBeFalsy();
			specHelper.simulateTextInput($emailField, '');
			expect($emailField.hasClass('validation-error')).toBeTruthy();
			specHelper.simulateTextInput($emailField, 'adsf');
			expect($emailField.hasClass('validation-error')).toBeFalsy();

			//check length
			specHelper.simulateTextInput($emailField, (new Array(66)).join('a'));
			expect($emailField.hasClass('validation-error')).toBeTruthy();
			specHelper.simulateTextInput($emailField, (new Array(63)).join('a'));
			expect($emailField.hasClass('validation-error')).toBeFalsy();

			expect($button.is(':disabled')).toBeTruthy();
		});

		it('should force user to accept terms', () => {
			let $testArea = specHelper.setupTest("registrationForm_es_MX", {}, "es_MX");
			registrationFormController.initialize();
			let $passwordOne = $testArea.find("#password-one");
			let $passwordTwo = $testArea.find("#password-two");
			let $emailField = $testArea.find('#email-input');
			let $button = $testArea.find("#registration-submit-button");
			let $termsCheckbox = $testArea.find('#accept-terms');
			specHelper.simulateTextInput($passwordOne, 'asdf');
			specHelper.simulateTextInput($passwordTwo, 'asdf');
			specHelper.simulateTextInput($emailField, 'asdf');

			expect($button.is(':disabled')).toBeTruthy();
			$termsCheckbox.attr('checked', true).change();
			expect($button.is(':disabled')).toBeFalsy();
			$termsCheckbox.attr('checked', false).change();
			expect($button.is(':disabled')).toBeTruthy();
		});

	});

	describe("Registration ajax", () => {

		describe("Schema errors", () => {
			it('should throw an error for invalid email', () => {
				let $testArea = specHelper.setupTest("registrationForm_es_MX", {}, "es_MX");
				specHelper.registerMockAjax("/api/auth/register", {
					"schemaErrors": [
						{
							"field": "data.emailAddress",
							"message": "pattern mismatch"
						},
						{
							"field": "data.password",
							"message": "has less length than allowed"
						}
					]
				}, {
					fail: true,
					status: 400
				});
				registrationFormController.initialize();

				let $passwordOne = $testArea.find("#password-one");
				let $passwordTwo = $testArea.find("#password-two");
				let $emailField = $testArea.find('#email-input');
				let $button = $testArea.find("#registration-submit-button");
				let $termsCheckbox = $testArea.find('#accept-terms');
				let $emailInvalid = $testArea.find('#invalid-email');

				specHelper.simulateTextInput($passwordOne, 'asdfas');
				specHelper.simulateTextInput($passwordTwo, 'asdfas');
				specHelper.simulateTextInput($emailField, 'asdf');
				$termsCheckbox.attr('checked', true).change();

				expect($button.is(":disabled")).toBeFalsy();

				$button.click();
				expect($emailInvalid.hasClass('hidden')).toBeFalsy();
				expect($emailField.hasClass('validation-error')).toBeTruthy();
				expect($passwordOne.hasClass('validation-error')).toBeTruthy();
				expect($passwordTwo.hasClass('validation-error')).toBeTruthy();
			});

			it('should show the success text for a 200', () => {
				let $testArea = specHelper.setupTest("registrationForm_es_MX", {}, "es_MX");
				specHelper.registerMockAjax("/api/auth/register", {});
				registrationFormController.initialize();
				let $passwordOne = $testArea.find("#password-one");
				let $passwordTwo = $testArea.find("#password-two");
				let $emailField = $testArea.find('#email-input');
				let $button = $testArea.find("#registration-submit-button");
				let $termsCheckbox = $testArea.find('#accept-terms');
				specHelper.simulateTextInput($passwordOne, 'asdf');
				specHelper.simulateTextInput($passwordTwo, 'asdf');
				specHelper.simulateTextInput($emailField, 'asdf@asdf.com');
				$termsCheckbox.attr('checked', true).change();

				expect($button.is(":disabled")).toBeFalsy();

				$button.click();
				expect($("#registration-success").hasClass('hidden')).toBeFalsy();
			});
		});

	});
});
