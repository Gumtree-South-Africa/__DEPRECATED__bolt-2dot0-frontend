"use strict";
let path = require("path");
let webpack = require("webpack");

module.exports = {
	devtool: "source-map",
	module: {
		loaders: [
			{
				loader: "babel-loader",
				test: "",
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
			app: path.resolve(process.cwd(), 'app'),
			public: path.resolve(process.cwd(), 'public'),

			// see http://isotope.metafizzy.co/extras.html#webpack
			masonry: 'masonry-layout',
			isotope: 'isotope-layout'
		}
	},
	plugins: [
		// todo: we need to turn off uglify for debugging locally
		// with uglify, client script debugging is difficult because:
		// 1) one cannot set breakpoints on jasmine expect statements
		// 2) in the locals window, names are mangled, and one must use mangled names in console
		// comment out this plugin for easier client script debugging
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,	// defaults to true, but nice to see it explicit
			compress: {
				warnings: false
			}
		}),
		new webpack.ProvidePlugin({
			$: "jquery",
			jQuery: "jquery"
		})
	]
};
