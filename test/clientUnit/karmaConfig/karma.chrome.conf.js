module.exports = function (config) {
    config.set({
        frameworks: ["jasmine"],
        files: [
			"../../../public/js/libraries/handlebars/handlebars-v4.0.5.js",
			"../helpers/webTemplates.js",
			"../SpecRunner_Bundle.js"
        ],
		reporters: ["spec"],
		browsers: ["Chrome"],
		preprocessors: {
			'**/*.js': ['sourcemap']
		}
	});
};

