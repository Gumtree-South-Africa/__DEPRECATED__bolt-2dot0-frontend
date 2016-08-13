"use strict";

let _ = require("underscore");

let baseWebpackConfig = require("./webpack.base.config.js");
let bundleConfig = require(process.cwd() + "/app/config/bundling/bundleMap.json");

baseWebpackConfig.plugins.shift(); //  remove uglifyjs plugin

let entries = _.mapObject(bundleConfig, (bundlePath) => {
	return `${bundlePath}`;
});

let appWebpackConfig = {
	entry: entries,
	output: {
		path: 'public/jsmin',
		// in this case [name] will be the entry key, for example the specRunner entry ends up being "test/clientUnit/SpecRunner"
		// it figures out that you end in a directory called "clientUnit", with a file called "SpecRunnerBundle"
		filename: '[name].js'
	}
};

module.exports = _.extend(baseWebpackConfig, appWebpackConfig);
