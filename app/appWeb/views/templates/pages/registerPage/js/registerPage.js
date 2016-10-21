'use strict';

let registrationForm = require("app/appWeb/views/components/registrationForm/js/registrationForm.js");
class RegisterPage {
	initialize() {
		registrationForm.initialize();
	}
}

module.exports = new RegisterPage();
