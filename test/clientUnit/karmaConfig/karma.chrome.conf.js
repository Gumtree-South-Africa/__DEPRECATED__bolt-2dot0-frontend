'use strict';
let webpackConfig = require(process.cwd() + '/app/config/bundling/webpack.test.config.js');
module.exports = function (config) {
	config.set({
		frameworks: ['jasmine'],
		files: [
			'public/js/libraries/handlebars/handlebars-v4.0.5.js',
			'test/clientUnit/helpers/webTemplates.js',
			'node_modules/jquery/dist/jquery.js',
			'public/js/common/tracking/Analytics.js',
			'test/clientUnit/SpecRunner.js'
		],
		browsers: ['Chrome_custom'],
		reporters: ['spec', 'coverage'],
		preprocessors: {
			'test/clientUnit/**/*.js': ['webpack']
		},
		coverageReporter: {
			type : 'html',
			dir : 'test/clientUnit/coverage/',
			includeAllSources: true
		},
		// you can define custom flags
		customLaunchers: {
			'Chrome_custom': {
				base: 'Chrome',
				flags: ['--no-sandbox'] // with sandbox it fails under Docker
			}
		},
		webpack: webpackConfig,
		plugins: [
			'karma-sourcemap-loader',
			'karma-spec-reporter',
			require('karma-webpack'),
			'karma-chrome-launcher',
			'karma-coverage',
			'istanbul-instrumenter-loader',
			'karma-jasmine'
		]
	});
};
