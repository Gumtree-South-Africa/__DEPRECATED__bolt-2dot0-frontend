
let initialize = (locale) => {
	window.BOLT = window.BOLT || {};
	window.BOLT.Handlebars = require("../../../../node_modules/handlebars/dist/handlebars.runtime.min.js");
	require("../../precompTemplates.js");

	let clientHelpers = require("./clientHbsHelpers.js");
	clientHelpers.initialize(window.BOLT.Handlebars);
	clientHelpers.setLocale(locale);
};

module.exports = {
	initialize
};
