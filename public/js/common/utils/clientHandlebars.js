
let initialize = (locale) => {
	Handlebars = require("../../../../node_modules/handlebars/dist/handlebars.runtime.min.js");
	require("../../precompTemplates.js");

	let clientHelpers = require("./clientHbsHelpers.js");
	clientHelpers.initialize(Handlebars);
	clientHelpers.setLocale(locale);
};

module.exports = {
	initialize
};
