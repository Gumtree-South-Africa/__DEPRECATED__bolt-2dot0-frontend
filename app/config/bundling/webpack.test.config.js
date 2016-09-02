"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	devtool: "inline-source-map"
};

baseWebpackConfig.module.loaders.push({
	test: /\.json$/,
	loader: "json-loader"
});

baseWebpackConfig.plugins.shift(); //Dont UGlify tests
baseWebpackConfig.plugins.shift(); // Dont common chunk creation

module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

