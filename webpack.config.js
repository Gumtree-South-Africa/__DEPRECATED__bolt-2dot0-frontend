'use strict';

let ExtractTextPlugin = require("extract-text-webpack-plugin"),
	path = require('path');

let plugins = [
	new ExtractTextPlugin('css/bundle.css', {
		allChunks: true
	})
];

module.exports = {
	plugins: plugins,
	entry: {
		'js/common/bundles/isotope': './app/views/components/tileGrid/js/tileGrid.js',
		'js/common/bundles/jasmineUnitTest': './test/unit/SpecRunner.js'
	},
	output: {
		path: 'public/',
		filename: '[name]_bundle.js',
		hasFunction: 'sha256'
	},
	module: {
		loaders: [
			{
				test: /isotope-layout/,
				loader: 'imports?define=>false&this=>window'
			},
			{
				test: /\.js/,
				loader: 'babel',
				include: __dirname + '/src'
			},
			{
				test:   /\.scss/,
				loader: ExtractTextPlugin.extract('style', 'css!sass'),
			}
		]
	},
	resolve: {
		// add alias for application code directory
		alias: {
			app: path.resolve(__dirname, 'app')
		}
	}
};
