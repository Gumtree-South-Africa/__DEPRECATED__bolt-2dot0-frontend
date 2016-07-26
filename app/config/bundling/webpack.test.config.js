"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");

let testWebpackConfig = {
	devtool: "inline-source-map"
};



module.exports = _.extend(baseWebpackConfig, testWebpackConfig);

