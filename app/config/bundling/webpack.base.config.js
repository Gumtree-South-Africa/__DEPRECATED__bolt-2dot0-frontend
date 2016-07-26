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
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,
			compress: {
				warnings: false
			}
		}),
		new webpack.ProvidePlugin({
			$: 'jquery'  // provide jquery on the global $
		}),
		new webpack.optimize.CommonsChunkPlugin("MainV2.min.js") // common Main.js File
	]
};
