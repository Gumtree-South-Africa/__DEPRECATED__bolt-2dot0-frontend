"use strict";

let path = require("path");

module.exports = {
	entry: {
		"test/clientUnit/SpecRunner": "./test/clientUnit/SpecRunner.js",
		"public/jsmin/homepageV2": "./app/views/templates/pages/homepageV2/js/homepageV2.js"
	},
	output: {
		path: '',
		// in this case [name] will be the entry key, for example the specRunner entry ends up being "test/clientUnit/SpecRunner"
		// it figures out that you end in a directory called "clientUnit", with a file called "SpecRunnerBundle"
		filename: '[name]Bundle.js'
	},
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				test: __dirname,
				exclude: /node_modules/,
				query: {
					presets: 'es2015-webpack'
				}
			},
			// see http://isotope.metafizzy.co/extras.html#webpack
			{
				test: /isotope-layout/,
				loader: 'imports?define=>false&this=>window'
			}
		]
	},
	resolve: {
		// add alias for application code directory
		alias: {
			app: path.resolve(__dirname, 'app'),
			public: path.resolve(__dirname, 'public'),

			// see http://isotope.metafizzy.co/extras.html#webpack
			'masonry': 'masonry-layout',
			'isotope': 'isotope-layout'
		}
	}
};
