"use strict";
let webpackConfig = require(process.cwd() + "/app/config/bundling/webpack.test.config.js");
module.exports = function (config) {
	config.set({
		frameworks: ["jasmine"],
		files: [
			"../../../public/js/libraries/handlebars/handlebars-v4.0.5.js",
			"../helpers/webTemplates.js",
			"../../../node_modules/jquery/dist/jquery.js",
			"../../../public/js/common/tracking/Analytics.js",
			"../SpecRunner.js"
		],
		browsers: ['PhantomJS_custom'],
		reporters: ["spec"],
		preprocessors: {
			'../**/*.js': ['webpack']
		},
		// you can define custom flags
		customLaunchers: {
			'PhantomJS_custom': {
				base: 'PhantomJS',
				options: {
					windowName: 'my-window',
					settings: {
						webSecurityEnabled: false
					}
				},
				flags: ['--load-images=true'],
				debug: true
			}
		},

		phantomjsLauncher: {
			// Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
			exitOnResourceError: true
		},
		webpack: webpackConfig,
		plugins: [
			"karma-spec-reporter",
			"karma-jasmine",
			require("karma-webpack"),
			"karma-phantomjs-launcher"
		]
	});
};
