"use strict";

let webpackConfig = require(process.cwd() + "/app/config/bundling/webpack.test.config.js");
module.exports = function (config) {
	config.set({
		frameworks: ["jasmine"],
		files: [
			"public/js/libraries/handlebars/handlebars-v4.0.5.js",
			"test/clientUnit/helpers/webTemplates.js",
			"node_modules/jquery/dist/jquery.js",
			"public/js/common/tracking/Analytics.js",
			"test/clientUnit/SpecRunner.js"
		],
		reporters: ["spec", "coverage"],
		browsers: ['PhantomJS_custom'],
		preprocessors: {
			'**/*.js': ['webpack', 'sourcemap', 'coverage']
		},
		coverageReporter: {
			type : 'html',
			dir : 'test/clientUnit/coverage/',
			includeAllSources: true
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
			"karma-sourcemap-loader",
			"karma-spec-reporter",
			"karma-jasmine",
			require("karma-webpack"),
			"karma-phantomjs-launcher",
			"karma-coverage",
			"istanbul-instrumenter-loader"
		]
	});
};
