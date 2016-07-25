"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	entry: {
		"SpecRunner": "./test/clientUnit/SpecRunner.js"
	},
	output: {
		path: 'test/clientUnit/',
		filename: '[name]Bundle.js'
	}
};



module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

