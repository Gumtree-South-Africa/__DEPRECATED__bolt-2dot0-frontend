'use strict';

let loginForm = require("app/appWeb/views/components/loginForm/js/loginForm.js");
class LoginPage {
	initialize() {
		loginForm.initialize({
			extraOpenDom: $("#login-container")
		});
	}
}

module.exports = new LoginPage();
