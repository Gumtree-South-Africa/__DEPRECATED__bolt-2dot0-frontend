"use strict";

let webpackConfig = require(process.cwd() + "/app/config/bundling/webpack.test.config.js");
module.exports = function (config) {
    config.set({
        frameworks: ["jasmine"],
        files: [
			"../../../public/js/libraries/handlebars/handlebars-v4.0.5.js",
			"../helpers/webTemplates.js",
			"../SpecRunner.js"
        ],
		reporters: ["spec"],
		browsers: ["Chrome"],
		preprocessors: {
			'../**/*.js': ['webpack', 'sourcemap']
		},
		webpack: webpackConfig,
		plugins: [
			"karma-sourcemap-loader",
			"karma-spec-reporter",
			"karma-jasmine",
			require("karma-webpack"),
			"karma-chrome-launcher"
		]
	});
};

