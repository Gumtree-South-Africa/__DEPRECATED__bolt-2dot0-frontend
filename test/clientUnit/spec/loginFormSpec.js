"use strict";

let loginFormController = require("app/appWeb/views/components/loginForm/js/loginForm.js");
let specHelper = require('../helpers/commonSpecHelper.js');


describe("Login Form", () => {
	it("should expand sign in area when drawing focus to the email field", () => {
		let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

		let $extraOpenDom = $testArea.append("<div></div>");

		loginFormController.initialize({
			extraOpenDom: $extraOpenDom
		});

		expect($testArea.find(".sign-in-section").hasClass("open")).toBeFalsy();
		$testArea.find('input[type="email"]').focus();
		expect($testArea.find(".sign-in-section").hasClass("open")).toBeTruthy();
		expect($extraOpenDom.hasClass("open")).toBeTruthy();
	});

	it("should toggle the visible password inputs when clicking the show/hide password button/icon", () => {
		let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

		let $passwordInput = $testArea.find('input[type="password"]');
		let $showPassInput = $testArea.find('input[type="text"]');
		let $showHideBtn = $testArea.find('.show-hide-password');

		loginFormController.initialize();
		expect($passwordInput.hasClass("hidden")).toBeFalsy(); // password input is visible on load
		expect($showPassInput.hasClass("hidden")).toBeTruthy(); // show password input is hidden on load

		$showHideBtn.click();

		expect($passwordInput.hasClass("hidden")).toBeTruthy(); // password input is hidden after one click (toggle)
		expect($showPassInput.hasClass("hidden")).toBeFalsy(); // show password is visible after one click (toggle)

		$showHideBtn.click();

		expect($passwordInput.hasClass("hidden")).toBeFalsy(); // password input is visible after second click (toggle back)
		expect($showPassInput.hasClass("hidden")).toBeTruthy(); // show password is hidden after second click (toggle back)
	});

	describe("Login Failure", () => {
		it("should mark validation errors returned to us in the ajax response", () => {
			let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

			specHelper.registerMockAjax("/api/auth/login", {
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

			loginFormController.initialize();

			let $emailInput = $testArea.find('input[type="email"]');
			let $passInput = $testArea.find('input[type="password"]');
			$emailInput.val("noreply.com");
			$passInput.val("short-but-not-really");
			$testArea.find('.submit-btn').click();

			expect($emailInput.hasClass("validation-error")).toBeTruthy();
			expect($passInput.hasClass("validation-error")).toBeTruthy();
		});

		it("should mark both inputs as validation on 401 unauthorized from the server", () => {
			let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

			specHelper.registerMockAjax("/api/auth/login", {}, {
				fail: true,
				status: 401
			});

			loginFormController.initialize();

			let $emailInput = $testArea.find('input[type="email"]');
			let $passInput = $testArea.find('input[type="password"]');
			$emailInput.val("noreply.@noReply.com");
			$passInput.val("longEnough");
			$testArea.find('.submit-btn').click();

			expect($emailInput.hasClass("validation-error")).toBeTruthy();
			expect($passInput.hasClass("validation-error")).toBeTruthy();
		});

		it("should mark validation error for too long a string for email", () => {
			let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

			loginFormController.initialize();

			let $emailInput = $testArea.find('input[type="email"]');
			let $passInput = $testArea.find('input[type="password"]');
			$emailInput.val("ReallylongReallylongReallylongReallylongReallylongReallylongReallylongReallylongReallylong");
			$passInput.val("short-but-not-really");
			$testArea.find('.submit-btn').click();

			expect($emailInput.hasClass("validation-error")).toBeTruthy();
			expect($passInput.hasClass("validation-error")).toBeFalsy();
		});

		it("should mark validation error for too long a string for email", () => {
			let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

			loginFormController.initialize();

			let $emailInput = $testArea.find('input[type="email"]');
			let $passInput = $testArea.find('input[type="password"]');
			$emailInput.val("noreply@noreply.com");
			$passInput.val("short");
			$testArea.find('.submit-btn').click();

			expect($emailInput.hasClass("validation-error")).toBeFalsy();
			expect($passInput.hasClass("validation-error")).toBeTruthy();
		});

		it("should clear validation errors when inputs are interacted with", () => {
			let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

			loginFormController.initialize();

			let $emailInput = $testArea.find('input[type="email"]');
			let $passInput = $testArea.find('input[type="password"]');
			$emailInput.val("ReallylongReallylongReallylongReallylongReallylongReallylongReallylongReallylongReallylong");
			$passInput.val("short");
			$testArea.find('.submit-btn').click();

			expect($emailInput.hasClass("validation-error")).toBeTruthy();
			expect($passInput.hasClass("validation-error")).toBeTruthy();

			specHelper.simulateTextInput($emailInput, "noReply@noReply.com");
			specHelper.simulateTextInput($passInput, "longEnough");

			expect($emailInput.hasClass("validation-error")).toBeFalsy();
			expect($passInput.hasClass("validation-error")).toBeFalsy();
		});
	});

	describe("Login Success", () => {
		it("should call the submitCb if one is set on the component", () => {
			let $testArea = specHelper.setupTest("loginForm", {}, "es_MX");

			loginFormController.initialize();
			loginFormController.setSubmitCb(() => {});

			spyOn(loginFormController, "submitCb");

			specHelper.registerMockAjax("/api/auth/login", {}); // 200 ok but we dont care about the response

			let $emailInput = $testArea.find('input[type="email"]');
			let $passInput = $testArea.find('input[type="password"]');
			$emailInput.val("noReply@noReply.com");
			$passInput.val("longEnough");
			$testArea.find('.submit-btn').click();

			expect(loginFormController.submitCb).toHaveBeenCalled();
		});
	});
});
