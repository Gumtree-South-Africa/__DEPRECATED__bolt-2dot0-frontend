"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let ruiWebpackConfig = {
	entry: {
		"HeaderFooterV2": "app/config/bundling/rui/HeaderFooterV2Config.js"
	},
	output: {
		path: 'app/config/bundling/rui/',
		filename: '[name].js'
	}
};



module.exports = _.extend(baseWebpackConfig, ruiWebpackConfig);