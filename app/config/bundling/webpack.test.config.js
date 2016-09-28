"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	devtool: "inline-source-map"
};

baseWebpackConfig.plugins.shift(); //Dont UGlify tests
baseWebpackConfig.plugins.shift(); // Dont common chunk creation

baseWebpackConfig.module.loaders.push({
	test: /\.json$/,
	loader: "json-loader"
});

baseWebpackConfig.module.preLoaders = [
		// instrument only testing sources with Istanbul
		{
			test: /\.js$/,
			loader: 'istanbul-instrumenter',
			exclude: /(test|node_modules|modules)/
		}
];


module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

