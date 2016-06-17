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
				test:   /\.js/,
				loader: 'babel',
				include: __dirname + '/src',
			}
		]
	}
};
