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
                browsers: ['Chrome_custom'],
                reporters: ["spec"],
                preprocessors: {
                        '../**/*.js': ['webpack']
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
                        "karma-spec-reporter",
                        "karma-jasmine",
                        require("karma-webpack"),
                        "karma-chrome-launcher"
                ]
        });
};
