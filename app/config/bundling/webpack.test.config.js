"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	devtool: "inline-source-map"
};

baseWebpackConfig.plugins.shift(); //Dont UGlify tests


module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

