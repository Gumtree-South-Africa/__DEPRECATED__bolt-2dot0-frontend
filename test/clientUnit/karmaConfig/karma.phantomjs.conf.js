module.exports = function (config) {
	config.set({
		frameworks: ["jasmine"],
		files: [
			"../../../public/js/libraries/handlebars/handlebars-v4.0.5.js",
			"../helpers/webTemplates.js",
			"../SpecRunner_Bundle.js"
		],
		browsers: ['PhantomJS_custom'],
		reporters: ["spec"],
		// you can define custom flags
		customLaunchers: {
			'PhantomJS_custom': {
				base: 'PhantomJS',
				options: {
					windowName: 'my-window',
					settings: {
						webSecurityEnabled: false
					}
				},
				flags: ['--load-images=true'],
				debug: true
			}
		},

		phantomjsLauncher: {
			// Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
			exitOnResourceError: true
		}
	});
};
