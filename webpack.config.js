module.exports = {
	entry: {
		"test/clientUnit/SpecRunner": "./test/clientUnit/SpecRunner.js"
	},
	output: {
		path: '',
		filename: '[name]Bundle.js'
	},
	module: {
		loaders: [
			{
				loader: 'babel-loader',
				test: __dirname,
				exclude: /node_modules/,
				query: {
					presets: 'es2015'
				}
			}
		]
	}
};
