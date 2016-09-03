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
			},
			// because we have jquery outside of webpack to accommodate global "bolt",
			// we need to force bridget to use that instance of jquery using the following,
			// determined via analysis of the bridget library loading sequence
			{
				test: /bridget/,
				loader: 'imports?define=>false&module=>false'
			},
			// same for slick
			{
				test: /slick/,
				loader: 'imports?define=>false&exports=>undefined'
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
		// *******************************************************************
		// PLEASE DO NOT REMOVE THIS UGLIFYJS PLUGIN FROM THE TOP OF THE ARRAY
		// *******************************************************************
		new webpack.optimize.UglifyJsPlugin({
			sourceMap: true,	// defaults to true, but nice to see it explicit
			compress: {
				warnings: false
			}
		}),
		// *******************************************************************
		// PLEASE DO NOT REMOVE THIS COMMONS CHUNK PLUGIN FROM SECOND IN THE ARRAY
		// *******************************************************************
		new webpack.optimize.CommonsChunkPlugin("MainV2.min.js") // common Main.js File
	]
};
