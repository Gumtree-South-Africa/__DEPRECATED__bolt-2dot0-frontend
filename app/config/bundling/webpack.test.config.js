"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	entry: {
		"SpecRunner": "./test/clientUnit/SpecRunner.js"
	},
	output: {
		path: 'test/clientUnit/',
		filename: '[name]_Bundle.js'
	}
};



module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

