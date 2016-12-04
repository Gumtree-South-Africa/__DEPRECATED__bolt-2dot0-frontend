"use strict";

let initialize = (options) => {
	let locale = $('html').data('locale');
	window.Handlebars = require("../../../../node_modules/handlebars/dist/handlebars.runtime.min.js");
	require("../../precompTemplates.js");

	let clientHelpers = require("./clientHbsHelpers.js");
	clientHelpers.initialize(Handlebars, options);
	if (locale) {
		clientHelpers.setLocale(locale);
	}
};

let renderTemplate = (templateName, model) => {
	let template = Handlebars.partials[templateName];

	if (!template) {
		throw Error(`No precompiled template with the name -> ${templateName}`);
	}

	return template(model);
};

module.exports = {
	initialize,
	renderTemplate
};
