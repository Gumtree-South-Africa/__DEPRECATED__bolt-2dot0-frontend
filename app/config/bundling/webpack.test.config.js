"use strict";

let _ = require("underscore");
let webpack = require('webpack');

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	devtool: "inline-source-map",
	module: {
		// for client unit tests, allow json files to be required
		loaders: [
			{
				test: /\.json$/,
				loader: "json-loader"
			}
		]
	}
};

baseWebpackConfig.plugins.shift(); //Dont UGlify tests
baseWebpackConfig.plugins.shift(); // Dont common chunk creation
baseWebpackConfig.plugins.push(new webpack.ProvidePlugin({
	$: "jquery",
	jQuery: "jquery"
}));

module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

