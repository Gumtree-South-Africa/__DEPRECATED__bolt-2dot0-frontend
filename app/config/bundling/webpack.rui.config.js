"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");
let uglify = baseWebpackConfig.plugins.shift();
baseWebpackConfig.plugins.shift(); // remove common bundle
baseWebpackConfig.plugins.push(uglify);

let ruiWebpackConfig = {
	entry: {
		"HeaderFooterV2": "app/config/bundling/rui/HeaderFooterV2Rui.js"
	},
	output: {
		path: 'app/config/bundling/rui/compiled',
		filename: '[name].js'
	}
};



module.exports = _.extend(baseWebpackConfig, ruiWebpackConfig);
