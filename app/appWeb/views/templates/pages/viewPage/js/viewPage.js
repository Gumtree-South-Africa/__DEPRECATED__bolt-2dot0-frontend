'use strict';

let viewContent = require("app/appWeb/views/components/registrationForm/js/registrationForm.js");

class ViewPage {
	initialize() {
		viewContent.initialize();
	}
}

module.exports = new ViewPage();
