"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	devtool: "inline-source-map"
};

baseWebpackConfig.plugins.shift(); //Dont UGlify tests

baseWebpackConfig.module.loaders.push({
	test: /\.json$/,
	loader: "json-loader"
});


module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

